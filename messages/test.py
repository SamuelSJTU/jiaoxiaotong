# -*-coding:utf-8 -*-
import json # import the module of json
import sys # this module is used to get the params from cmd
params = sys.argv[1]
obj = json.loads(params) #str to obj
jsonob = {'name':'alex','age':18,'gender':'male'}
strjson = json.dumps(jsonob,sort_keys=True)
print(strjson)