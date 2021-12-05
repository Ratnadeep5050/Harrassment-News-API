const axios = require("axios")
const cheerio = require("cheerio")
const { json } = require("express")

var count = 1
const articles = []

async function getNews(res, url) {
        axios.get(url).then((response) => {
            const html = response.data
            const $ = cheerio.load(html)    
    
            $('h3', html).each(function() {
                const title = $(this).text().trim()
                const exists = /\brape|raped|sexual assault|sexual harrassment|gang rape|gang raped\b/.test(title)
                const link = $(this).children('a').attr('href')
                var articleExists = false

                articles.find((article) => {
                    if(article.title == title) {
                        articleExists = !articleExists
                    }
                });

                if(exists && !articleExists) {
                    articles.push({
                        title,
                        link
                    })
                    for(var i=0; i<articles.length; i++) {
                        if(articles[i].test == title) {
                            console.log(title)
                        }
                    }
                }
            })
    
            if(count > 20) {
                console.log("done")
                res.json(articles)
            }
            else {  
                count++
                const numberSplit = url.split("=")
                const nextPageNumber = parseInt(numberSplit[1]) + 1
                console.log(nextPageNumber)
                let nextUrl = `${numberSplit[0]}=${nextPageNumber}`
                console.log(nextUrl)
                return articles.concat(getNews(res, nextUrl))
            }
        }).catch(function (error) {
            console.log("Error", error)
        })
}

module.exports = { getNews }