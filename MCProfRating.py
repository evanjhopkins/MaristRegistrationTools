from flask import Flask, request
import string
import urllib2
import urllib
import re
import json
import mechanize

app = Flask(__name__)

@app.route('/get_prof_rating/<string:prof>')
def overview(prof):
	name = clean_name(prof)
	urlencoded_name = name.replace (" ", "+")
	url = "http://search.mtvnservices.com/typeahead/suggest/?solrformat=true&rows=10&callback=jQuery111009371809768490493_1447205824799&prefix="+urlencoded_name+"&qf=teacherfullname_t%5E1000+teacherfullname_autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&defType=edismax&siteName=rmp&group=off&group.field=content_type_s&group.limit=20&fq=content_type_s%3ATEACHER&fq=schoolname_t%3A%22Marist+College%22&fq=schoolid_s%3A563"
	response = urllib2.urlopen(url).read()

	#parse out jquery garbage
	jq_open = response.index('(')+1
	# jq_close = response[::-1].index(')')

	response = response[jq_open:]
	response = response[:-2]

	data = json.loads(response)

	#if no professors were found
	if data['response']['numFound'] < 1:
		return "?"

	prof = data['response']['docs'][0]
	prof_id = prof['pk_id']

	br = mechanize.Browser()
	br.set_handle_robots(False)

	url = "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=%s" % prof_id
	# br.open(url)
	# page = br.response()

	rating = str(crawlURL(url))

	return rating

def clean_name(name):
	exploded_name = string.split(name, " ")

	cleaned_exploded_name = []
	for word in exploded_name:
		if(len(word) < 2):
			continue
		if("(" in word):
			continue
		cleaned_exploded_name.append(word)

	cleaned_name = ' '.join(cleaned_exploded_name)
	return cleaned_name

def crawlURL(addedURL):
	url = addedURL
	html = urllib.urlopen(url).read()

	teacherData = re.findall(r'\">(.*?)</',html)
	for x in xrange(len(teacherData)):
		if (teacherData[x] == 'Helpfulness'):
			return str(teacherData[x-2])

if __name__ == '__main__':
	app.run("0.0.0.0", debug=True)
