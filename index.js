// Loading the dependencies. We don't need pretty
// because we shall not log html to the terminal
const axios = require("axios");
const cheerio = require("cheerio");
const nodemon = require("nodemon");
const express =  require('express');
const app = express();

const port = process.env.PORT || 3000;

// URL of the page we want to scrape
//const url = "https://www.amazon.in/dp/B0BZ48H8JX";

app.get('/', function(req, res){
    res.send({ 
        message: 'Welcome to render'
    });
});

app.get('/:id', async function(req, res){
    var productId = req.params.id;
    var dataObj = {};
    const url = `https://www.amazon.in/dp/${productId}`;

    try {
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data,{
            decodeEntities: true, 
        });

        dataObj.title = $('#productTitle').text().trim(); 
        dataObj.price = $('.a-price-whole').text().split('.')[0];
        dataObj.brand = $('#bylineInfo').text().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
        dataObj.brand_url = 'https://www.amazon.in' + $('#bylineInfo').attr('href');
      
        dataObj.availability_status = $('#availability').children('span').text().trim();

        dataObj.small_description = [];

        $('#feature-bullets>ul>li>span').each((i, el) => {
            dataObj.small_description.push($(el).text().replace(/[\n\t]/g, '').trim());
        });

        dataObj.product_information = {};
        const listInfoItems = $('#productOverview_feature_div table tr');
        listInfoItems.each((idx, el) => { 
            var evenInfo = $(el).children('td:even').children('span').text(); 
            var oddInfo = $(el).children('td:odd').children('span').text();
            dataObj.product_information[evenInfo] = oddInfo; 
        });    

        dataObj.images = [];

        const list = $('#altImages>ul>li');
        list.each((idx, el) => { 
            if($(el).find('img').attr('src') != undefined){
                var newUrl = formattedImageUrl($(el).find('img').attr('src'));
                if(newUrl != ''){
                    dataObj.images.push(newUrl);
                }
            } 
        });

        res.send({
            data: dataObj
        }); 
          
    } catch (err) {
        res.send({
            error: err,
            message: 'Something went wrong..................'
        });
    } 
});

function formattedImageUrl(url){
    var dataArray = url.split('.');
    if(dataArray['4'] == 'jpg'){
        dataArray['3'] = '_SX500_';
        var formattedUrl = dataArray.join('.');
        return formattedUrl;
    }else{
        return '';
    }
} 

app.listen(port, function(req, res){
    console.log('Server listening on port 3000');
});
 