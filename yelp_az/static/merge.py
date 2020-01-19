import csv
import pandas as pd 

REVIEWPATH = "data/review.csv"
INFOPATH = "data/info.csv"
GEOINFOPATH = "data/yelp.json"
OUTPATH = "data/merge.csv"

def main():
    review_data = pd.read_csv(REVIEWPATH)
    geo_data = pd.read_json(GEOINFOPATH)
    dict_data = []
    try:
    
        for i, row in review_data.iterrows():
            info_data = open(INFOPATH)
            inforeader = csv.reader(info_data, delimiter=',')
            exist = False
            date = " ".join(row[0].split("-")[:-1])
            url = row[1]
            for each in inforeader:
                if url in each:
                    title = each[0].strip(" ")
                    adrs1 = each[each.index(url)+1].strip(" ")
                    adrs2 = each[each.index(url)+2].strip(" ")
                    post = int(each[each.index(url)+3].strip(" "))
                    rate = int(each[each.index(url)+4].strip(" "))
                    categ = each[each.index(url)+5].strip(" ") 
                    price = each[each.index(url)+6].strip(" ")
                    break
                else:
                    title = None
            for data in dict_data:
                if date == data["date"]:
                    if title == data["title"]:
                        data["post"] += 1
                        data["rate"] += rate
                        exist = True
            if title and not exist:
                for j, geo_row in geo_data.iterrows():
                    if url.strip(" ") == geo_row["url"]:
                        dic = {}
                        dic["title"] = title
                        dic["date"] = date
                        dic["totalpost"] = post
                        dic["post"] = 1
                        dic["adrs1"] = adrs1
                        dic["adrs2"] = adrs2
                        dic["rate"] = rate
                        dic["categ"] = categ
                        dic["price"] = price
                        dic["lat"] = geo_row["lat"]
                        dic["lon"] = geo_row["lon"]
                        dic["url"] = url.strip(" ")
                        dict_data.append(dic)
                        break
            info_data.close()
    except:
        import ipdb; ipdb.set_trace()

    try:
        csv_columns = ["title","date","totalpost","post","adrs1","adrs2","rate","categ","price","lat","lon","url"]
        with open(OUTPATH, 'w') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
            writer.writeheader()
            for data in dict_data:
                writer.writerow(data)

    except IOError:
        print("I/O error")




if __name__ == '__main__':
    main()