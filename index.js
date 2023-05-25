// Loading the dependencies. We don't need pretty
// because we shall not log html to the terminal
const axios = require('axios');
const cheerio = require('cheerio');
const nodemon = require('nodemon');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

// URL of the page we want to scrape
//const url = "https://www.amazon.in/dp/B0BZ48H8JX";

app.get('/', function (req, res) {
    res.send({
        message: 'Cors added successfully'
    });
});

//products model
const PRODUCTS = mongoose.model('tbl_products', {
    title: String,
    product_id: String,
    description: String,
    created_date: String,
    image_url: Object,
    brand_url: String,
    purchase_url: String,
    price: String,
    is_active: Boolean
});

mongoose
    .connect(
        'mongodb+srv://parminder:9988641591%40ptk@cluster0-ix992.mongodb.net/db_products?retryWrites=true&w=majority',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )

    .then(() => {
        console.log('CONNECT.........................');
    });

app.get('/add/:id', async function (req, res) {
    var productId = req.params.id;
    var dataObj = {};
    const url = `https://www.amazon.in/dp/${productId}`;

    try {
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data, {
            decodeEntities: true
        });

        dataObj.title = $('#productTitle').text().trim();
        dataObj.price = $('.a-price-whole').text().split('.')[0];
        dataObj.brand = $('#bylineInfo')
            .text()
            .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        dataObj.brand_url =
            'https://www.amazon.in' + $('#bylineInfo').attr('href');

        dataObj.purchase_url = `${url}?tag=girlsfab-21&language=en_IN`;

        dataObj.availability_status = $('#availability')
            .children('span')
            .text()
            .trim();

        dataObj.small_description = [];

        $('#feature-bullets>ul>li>span').each((i, el) => {
            dataObj.small_description.push(
                $(el)
                    .text()
                    .replace(/[\n\t]/g, '')
                    .trim()
            );
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
            if ($(el).find('img').attr('src') != undefined) {
                var newUrl = formattedImageUrl($(el).find('img').attr('src'));
                if (newUrl != '') {
                    dataObj.images.push(newUrl);
                }
            }
        });

        var newProduct = new PRODUCTS({
            title: dataObj.title,
            product_id: productId,
            description: dataObj.small_description[0],
            created_date: new Date().toISOString(),
            image_url: dataObj.images,
            brand_url: dataObj.brand_url,
            purchase_url: dataObj.purchase_url,
            price: dataObj.price,
            is_active: dataObj.availability_status == 'In stock' ? true : false
        });

        newProduct.save().then(function (data) {
            console.log(
                'Product saved successfully==============================================='
            );
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

app.get('/delete/:id', async function (req, res) {
    const result = await PRODUCTS.findOneAndDelete(req.params.id);
    if (!result) {
        res.send({
            success: false,
            message: 'Product not found'
        });
    } else {
        res.send({
            success: true,
            message: 'Product deleted successfully'
        });
    }
});

app.get('/products/all', async function (req, res) {
    try {
        const productsData = await PRODUCTS.find({});
        res.send({
            total: productsData.length,
            data: productsData
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

function formattedImageUrl(url) {
    var dataArray = url.split('.');
    if (dataArray['4'] == 'jpg') {
        dataArray['3'] = '_SX500_';
        var formattedUrl = dataArray.join('.');
        return formattedUrl;
    } else {
        return '';
    }
}

app.listen(port, '0.0.0.0', function () {
    console.log('App running on port ' + port);
});
