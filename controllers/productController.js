let productController = module.exports;

productController.getAllProducts = async (req, res) => {
    try {
        console.log("GET:cont/cont/getAllProducts");
    } catch (err) {
        console.log(`ERROR: cont/cont/getAllProducts, ${err.message}`);
        res.json({ state: "fail", message: err.message });
    }
};

productController.addNewProduct = async (req, res) => {
    try {
        console.log("POST:cont/cont/addNewProduct");
        console.log(req.member);
        // TODO: product creation develop
    } catch (err) {
        console.log(`ERROR: cont/cont/addNewProduct, ${err.message}`);
    }
};

productController.updateChosenProduct = async (req, res) => {
    try {
        console.log("POST:cont/cont/updateChosenProduct");
    } catch (err) {
        console.log(`ERROR: cont/cont/updateChosenProduct, ${err.message}`);
    }
};
