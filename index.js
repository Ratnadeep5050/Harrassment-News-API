const port = process.env.PORT || 3000
const express = require("express")
const axios = require("axios")
const cheerio = require("cheerio")
const cors = require("cors")
const { getNews } = require("./Functions")
const admin = require('firebase-admin');
const serviceAccount = require('./sexual-harassment-news-api-firebase-adminsdk-xgjdl-0338a835dd.json');

const app = express()

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(cors());

const url = "https://www.thedailystar.net/news/bangladesh?page=1"

var newspapers = [
    {
        id: "TDS",
        name: "The Daily Star",
        url: "https://www.thedailystar.net/news/bangladesh",
        baseUrl: "https://www.thedailystar.net/"
    },
    {
        id: "TBS",
        name: "The Business Standard",
        url: "https://www.tbsnews.net/bangladesh",
        baseUrl: "https://www.tbsnews.net/"
    },
    {
        id: "DT",
        name: "Dhaka Tribune",
        url: "https://www.dhakatribune.com/articles/bangladesh",
        baseUrl: "https://www.dhakatribune.com/"
    },
    {
        id: "TNA",
        name: "The New Age",
        url: "https://www.newagebd.net/articlelist/302/Bangladesh",
        baseUrl: ""
    },
    {
        id: "TFE",
        name: "The Financial Express",
        url: "https://thefinancialexpress.com.bd/national",
        baseUrl: "https://thefinancialexpress.com.bd/"
    }
]

app.get("/", (req, res) => {
    res.send("Sports")
})

app.get("/news", async (req, res) => {
    getNews(res, url)
})

app.get("/firebase", async (req, res) => {
    await db.collection("news").add({
        "title": "Woman gang-raped in Bagerhat, accused made video",
        "newspaper": "The Business Standard",
        "url": "https://www.tbsnews.net/bangladesh/woman-gang-raped-bagerhat-accused-made-video-144058",
        "body": "",
        "date": ""
    });

    res.send();
});

app.get("/news/:newspaperId", (req, res) => {
    const newspaperId = req.params.newspaperId;

    const newspaper = newspapers.filter(x => x.id == newspaperId)

    const newspaperName = newspaper[0].name
    const newspaperUrl = newspaper[0].url
    const newspaperBaseUrl = newspaper[0].baseUrl

    console.log(newspaperUrl)

    axios.get(newspaperUrl).then((response) => {
        const html = response.data
        const $ = cheerio.load(html)

        const articles = []

        $('h3', html).each(function() {
            const title = $(this).text().trim()
            const exists = /\brape|raped|sexual assault|sexual harrassment|gang rape|gang raped\b/.test(title)
            const link = $(this).children('a').attr('href')

            if(exists) {
                articles.push({
                    title,
                    sourceUrl: newspaperBaseUrl+link,
                    newspaperName
                })
            }
        })
        res.json(articles)
    })
})

app.listen(port, "0.0.0.0")
