// Loading the dependencies. We don't need pretty
// because we shall not log html to the terminal
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const nodemon = require('nodemon');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// URL of the page we want to scrape
//const url = "https://www.amazon.in/dp/B0BZ48H8JX";

app.get('/', function (req, res) {
	res.send({
		message: 'App working fine.................12 AM'
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
	source: String,
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

app.post('/:source/:id', async function (req, res) {
	var productId = req.params.id,
		source = req.params.source,
		dataObj = {};
	const url = `https://www.amazon.in/dp/${productId}`;

	try {
		const result = await PRODUCTS.find({ product_id: productId });
		if (result.length > 0) {
			res.json({
				success: true,
				message: 'Product already exists'
			});
		} else {
			/* // Fetch HTML of the page we want to scrape
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
				var evenInfo = $(el)
					.children('td:even')
					.children('span')
					.text();
				var oddInfo = $(el).children('td:odd').children('span').text();
				dataObj.product_information[evenInfo] = oddInfo;
			});

			dataObj.images = [];

			const list = $('#altImages>ul>li');
			list.each((idx, el) => {
				if ($(el).find('img').attr('src') != undefined) {
					var newUrl = formattedImageUrl(
						$(el).find('img').attr('src')
					);
					if (newUrl != '') {
						dataObj.images.push(newUrl);
					}
				}
			}); */

			/* const browser = await puppeteer.launch({
				headless: false,
				defaultViewport: null,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
				ignoreDefaultArgs: ['--disable-extensions']
			}); */

			/* const browser = await puppeteer.launch({
				ignoreDefaultArgs: ['--disable-extensions'],
			}); */

			/* const browser = await puppeteer.launch({
				headless:false,
				args: ["--no-sandbox"]
			}); */

			/*const browser = await puppeteer.launch({
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
				ignoreDefaultArgs: ['--disable-extensions']
			});
		
			 // Open a new page
			const page = await browser.newPage();

			await page.goto(url, {
				waitUntil: "domcontentloaded",
			}); 

			const dataObj = await page.evaluate(() => {
				let responseObj = {};
				
				responseObj.title = document.querySelector('#productTitle').innerText;
				 
				const descriptionArray = document.querySelector('#feature-bullets'),
					liObj = descriptionArray.querySelector('ul').querySelectorAll('li'),
					descArray = [];
		
				Array.from(liObj).map((quote) => {
					descArray.push(quote.querySelector("span").innerText); 
				});
		
				responseObj.small_description = descArray; 
		
				responseObj.image_url = []; 
		
				const list = document.querySelector('#altImages'),
					imgList = list.querySelector('ul').querySelectorAll('li');
				
				const imagesData = [];
				for (const child of imgList) {
					var imgObj = child.querySelector('img');
					if(imgObj && imgObj.hasAttribute('src')){
						var srcUrl = imgObj.getAttribute('src');
						var dataArray = srcUrl.split('.');
						if (dataArray['4'] == 'jpg') {
							dataArray['3'] = '_SX500_';
							var formattedUrl = dataArray.join('.'); 
							imagesData.push(formattedUrl);
						}
					}
				}
				responseObj.images = imagesData; 
		
				responseObj.brand_url = 'https://www.amazon.in' + document.querySelector('#bylineInfo').getAttribute('href');
				//responseObj.purchase_url = url+'?tag=girlsfab-21&language=en_IN';
				responseObj.purchase_url = '?tag=girlsfab-21&language=en_IN';
				responseObj.price = document.querySelector('.a-price-whole').innerText.split('.')[0].replace(/[\n\t]/g, '').trim();
				
				let elem = document.querySelector('#availability'),
					children = elem?.children; 
				responseObj.availability_status = children[0].innerHTML ? children[0].innerHTML.replace(/[\n\t]/g, '').trim() : '';
				
				return responseObj;
			});

			await browser.close();

			var newProduct = new PRODUCTS({
				title: dataObj.title,
				product_id: productId,
				description: dataObj.small_description[0],
				created_date: new Date().toISOString(),
				image_url: dataObj.images,
				brand_url: dataObj.brand_url,
				purchase_url: url + dataObj.purchase_url,
				price: dataObj.price,
				source: source,
				is_active:
					dataObj.availability_status == 'In stock' ? true : false
			}); */

			const browser = await puppeteer.launch({
				headless: 'new',
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote'],
				ignoreDefaultArgs: ['--disable-extensions'],
				executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
			});

			// Open a new page
			const page = await browser.newPage();

			await page.goto(url, {
				waitUntil: "domcontentloaded",
			}); 
			
			const dataObj = {};

			//product title
			const titleObj = await page.evaluate((selector) => {
				let responseObj = {};
				return document.querySelector(selector).innerText;
			}, '#productTitle'); 

			dataObj.title = titleObj;

			//product description
			/* const descriptionObj = await page.evaluate((selector) => {
				const descriptionArray = document.querySelector(selector),
					liObj = descriptionArray.querySelector('ul').querySelectorAll('li'),
					descArray = [];

				Array.from(liObj).map((quote) => {
					descArray.push(quote.querySelector('span').innerText); 
				});

				return descArray; 
			}, '#feature-bullets');
			
			dataObj.description = descriptionObj;

			//product images
			const imagesObj = await page.evaluate((selector) => {
				const imagesData = [],
					list = document.querySelector(selector) ? document.querySelector(selector) : document.querySelector('#thumbImages'),
					imgList = list.querySelector('ul').querySelectorAll('li');			
				
				for (const child of imgList) {
					var imgObj = child.querySelector('img');
					if(imgObj && imgObj.hasAttribute('src')){
						var srcUrl = imgObj.getAttribute('src');
						var dataArray = srcUrl.split('.');
						if (dataArray['4'] == 'jpg') {
							dataArray['3'] = '_SX500_';
							var formattedUrl = dataArray.join('.'); 
							imagesData.push(formattedUrl);
						}
					}
				}
				return imagesData; 
			}, '#altImages');

			dataObj.images = imagesObj;

			//product brand url
			const brandUrlObj = await page.evaluate((selector) => {
				return 'https://www.amazon.in' + document.querySelector(selector).getAttribute('href');
			}, '#bylineInfo');

			dataObj.brand_url = brandUrlObj;

			//product price
			const priceObj = await page.evaluate((selector) => {
				return document.querySelector(selector).innerText.split('.')[0].replace(/[\n\t]/g, '').trim();
			}, '.a-price-whole');

			dataObj.price = priceObj;

			//product availability status
			const availabilityStatus = await page.evaluate((selector) => {
				let elem = document.querySelector(selector),
					children = elem?.children; 
				return children[0].innerHTML ? children[0].innerHTML.replace(/[\n\t]/g, '').trim() : '';
			}, '#availability');

			dataObj.availability_status = availabilityStatus; */

			await browser.close();

			res.json(dataObj);

			/* var newProduct = new PRODUCTS({
				title: dataObj.title,
				product_id: productId,
				description: dataObj.description[0],
				created_date: new Date().toISOString(),
				image_url: dataObj.images,
				brand_url: dataObj.brand_url, 
				purchase_url: url + '?tag=girlsfab-21&language=en_IN',
				price: dataObj.price,
				source: source,
				is_active:
					dataObj.availability_status == 'In stock' ? true : false
			});

			const result = await PRODUCTS.find({ product_id: productId });
			if (result.length > 0) {
				res.json({
					success: true,
					message: 'Product already exists'
				});
			} else {
				var retData = await newProduct.save();
				res.json({
					success: true,
					data: retData
				});
			} */
		}
	} catch (err) {
		res.json({
			success: false,
			message: err.message
		});
	}
});

app.patch('/:id', async function (req, res) {
	var productId = req.params.id;
	try {
		const updatedProduct = await PRODUCTS.findOneAndUpdate(
			{ product_id: productId },
			req.body,
			{
				new: true
			}
		);

		if (updatedProduct) {
			res.json({ success: true, data: updatedProduct });
		} else {
			res.json({ success: false, message: 'No product found' });
		}
	} catch (err) {
		res.json({
			success: false,
			message: err.message
		});
	}
});

app.delete('/:id', async function (req, res) {
	var productId = req.params.id;
	const result = await PRODUCTS.findOneAndDelete({ product_id: productId });
	if (!result) {
		res.json({
			success: false,
			message: 'Product not found'
		});
	} else {
		res.json({
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
