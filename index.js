const express = require('express');
const app = express();
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

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

app.get('/', function(req, res){
    res.json({
	    message: 'Working fine'
    });
});

app.get('/product/:id', async function(req, res){
    var productId = req.params.id;

    try {
        const result = await PRODUCTS.find({ product_id: productId });
		if (result.length > 0) {
			res.send({
				success: true,
				message: 'Product already exists'
			});
		} else {
            let dataObj = {};
            let response = await fetch('https://affiliate-api.flipkart.net/affiliate/1.0/product.json?id=' + productId, {
                method: 'GET',
                headers: {
                    'Fk-Affiliate-Id': 'singh1par',
                    'Fk-Affiliate-Token': '1d5f2616c8c644f2806fe8da0c40946e'
                },
            });

            let data = await response.json();

            data = data.productBaseInfoV1;

            dataObj.title = data.title;
            dataObj.description = data.productDescription;
            dataObj.image_url = data.imageUrls;
            dataObj.purchase_url = data.productUrl;
            dataObj.price = data.flipkartSpecialPrice.amount;
            dataObj.source = 'flipkart';
            dataObj.is_active = data.inStock;

            var newProduct = new PRODUCTS({
				title: dataObj.title,
				product_id: productId,
				description: dataObj.description,
				created_date: new Date().toISOString(),
				image_url: dataObj.image_url,
				purchase_url: dataObj.purchase_url,
				price: dataObj.price,
				source: dataObj.source,
				is_active: dataObj.is_active
			});

            const result = await PRODUCTS.find({ product_id: productId });
			if (result.length > 0) {
				res.send({
					success: true,
					message: 'Product already exists'
				});
			} else {
				var retData = await newProduct.save();
				res.send({
					success: true,
					data: retData
				});
			}
        }
    } catch (err){
        res.send({
			success: false,
			message: err.message
		});
    }
});

app.get('/products', async function(req, res){
	const result = await PRODUCTS.find({ });
	if (result.length > 0) {
		console.log(result);
		res.send({
			total_count: result.length,
			products: result
		});
	}else{
		res.send({
			total_count: 0,
			products: []
			
		});
	}
})


app.listen(port, '0.0.0.0', function () {
	console.log('App running on port ' + port);
});
