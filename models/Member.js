const MemberModel = require("../schema/member.model");
const Definer = require("../lib/mistake");

class Member {
    constructor() {
        this.memberModel = MemberModel;
    }

    async signupData(input) {
        try {
            let result;
            const new_member = new this.memberModel(input);
            // const result = await new_member.save();
            try {
                result = await new_member.save();
            } catch (mongo_err) {
                console.log(mongo_err);
                throw new Error(Definer.auth_err1);
            }

            console.log(result);

            result.mb_password = "";
            return result;
        } catch (err) {
            throw err;
        }
    }

    // async saveNewMemberData() {
    //     try {
    //         await
    //     } catch(err)
    // }
}

module.exports = Member;
