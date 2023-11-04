const assert = require("assert");
const { shapeIntoMongooseObjectId } = require("../lib/config");
const ProductModel = require("../schema/product.model");
const Definer = require("../lib/mistake");

class Product {
    constructor() {
        this.productModel = ProductModel;
    }

    async getAllProductsDataResto(member) {
        try {
            member._id = shapeIntoMongooseObjectId(member._id);
            const result = await this.productModel.find({
                restaurant_mb_id: member._id,
            });
            assert.ok(result, Definer.general_err1);
            console.log(result);
            return result; //arrayda restaurant productlar= obj ni chiqaradi
        } catch (err) {
            throw err;
        }
    }

    async addNewProductData(data, member) {
        try {
            data.restaurant_mb_id = shapeIntoMongooseObjectId(member._id); //datani ichida restaurant mb id hosil qilyapmiz

            const new_product = new this.productModel(data);
            const result = await new_product.save();

            assert.ok(result, Definer.product_err1);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async updateChosenProductData(id, updated_data, mb_id) {
        try {
            id = shapeIntoMongooseObjectId(id);
            const result = await this.productModel
                .findOneAndUpdate(
                    { _id: id, restaurant_mb_id: mb_id },
                    updated_data,
                    {
                        runValidators: true,
                        lean: true,
                        returnDocument: "after", //yangilangan datani beradi. 'before' bolsa uzgarishdan keyingi datani beradi.
                    }
                )
                .exec();
            assert.ok(result, Definer.general_err1);
            return result;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = Product;
