import json
import re
import requests


# 擷取「上課時間及教室」之「時間」部分
def parse_time(tc):
    pattern = '[MTWRFSU][1-9yznabcd]+'
    tc_list = tc.split(',')
    time_list = []
    for item in tc_list:
        time = re.findall(pattern, item.split('-')[0])
        for t in time:
            time_list.append(t)
    return time_list


year = 109
semester = 2

url = "https://timetable.nctu.edu.tw/?r=main/get_cos_list"
# User-Agent 請求標頭（request header）含有能令網路協議同級層（peer）識別發出該用戶代理請求的軟體類型或版本號、該軟體使用的作業系統、還有軟體開發者的字詞串。
headers = {"user-agent": "Mozilla/5.0"}
data = {"m_acy": year,          # 學年度(開始)
        "m_sem": semester,      # 學期別(開始)
        "m_acyend": year,       # 學年度(結束)
        "m_semend": semester,   # 學期別(結束)
        "m_dep_uid": "**",
        "m_group": "**",
        "m_grade": "**",
        "m_class": "**",
        "m_option": "**",
        "m_crsname": "**",
        "m_teaname": "**",
        "m_cos_id": "**",
        "m_cos_code": "**",
        "m_crstime": "**",
        "m_crsoutline": "**",
        "m_costype": "**"}

# 資料型態為 json
r = requests.post(url, headers=headers, data=data)

# requests.codes.ok = 200
if r.status_code != requests.codes.ok:
    print("Data request error!")
    exit()

# 將 json 轉換為 python 可處理之資料型態
raw_data = json.loads(r.text)
course_data = {}
for dep_value in raw_data:
    language = raw_data[dep_value]["language"]
    for dep_content in raw_data[dep_value]:
        # if dep_content == "costype":
        #   pass

        # 課程資料在 dep_content 為 1 或 2 之物件裡
        if re.match("^[1-2]+$", dep_content) is None:
            continue
        for cos_id in raw_data[dep_value][dep_content]:
            # 避免加入重複課程
            if cos_id in course_data:
                continue
            raw_cos_data = raw_data[dep_value][dep_content][cos_id]
            time_list = parse_time(raw_cos_data["cos_time"])
            brief_code = list(raw_data[dep_value]["brief"][cos_id].keys())[0]
            brief = raw_data[dep_value]["brief"][cos_id][brief_code]['brief'].split(',')
            name = raw_cos_data["cos_cname"].replace("(英文授課)", '')
            course_data[cos_id] = {
                "id": raw_cos_data["cos_id"],                           # 當期課號
                "num_limit": raw_cos_data["num_limit"],                 # 人數上限
                "reg_num": raw_cos_data["reg_num"],                     # 修課人數
                "name": name,                                           # 課程名稱
                "credit": raw_cos_data["cos_credit"],                   # 學分
                "hours": raw_cos_data["cos_hours"],                     # 時數
                "teacher": raw_cos_data["teacher"],                     # 開課教師
                "time": time_list,                                      # 上課時間
                "time-classroom": raw_cos_data["cos_time"],             # 上課時間及教室
                "english": language[cos_id]["授課語言代碼"] == "en-us",   # 英語授課
                "brief": brief,                                         # 摘要
                "memo": raw_cos_data["memo"],                           # 說明
                "type": raw_cos_data["cos_type"],                       # 選別
            }

with open(str(year) + '-' + str(semester) + "_data.json", "w") as f:
    f.write(json.dumps(course_data))
