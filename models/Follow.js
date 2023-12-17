const {
  shapeIntoMongooseObjectId,
  lookup_auth_member_following,
} = require("../lib/config");
const Definer = require("../lib/mistake");
const assert = require("assert");

const FollowModel = require("../schema/follow.model");
const MemberModel = require("../schema/member.model");

class Follow {
  constructor() {
    this.followModel = FollowModel;
    this.memberModel = MemberModel;
  }

  // FOR SUBSCRIBE
  async subscribeData(member, data) {
    try {
      assert.ok(member._id !== data.mb_id, Definer.follow_err1);

      const subscriber_id = shapeIntoMongooseObjectId(member._id);
      const follow_id = shapeIntoMongooseObjectId(data.mb_id);

      const member_data = await this.memberModel
        .findById({ _id: follow_id })
        .exec();

      assert.ok(member_data, Definer.general_err2);

      const result = await this.createSubscriptionData(
        follow_id,
        subscriber_id
      );
      assert.ok(result, Definer.general_err1);

      await this.modifyMemberFollowCounts(follow_id, "subscriber_change", 1);
      await this.modifyMemberFollowCounts(subscriber_id, "follow_change", 1);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async createSubscriptionData(follow_id, subscriber_id) {
    try {
      const new_follow = new this.followModel({
        follow_id: follow_id,
        subscriber_id: subscriber_id,
      });
      return await new_follow.save();
    } catch (mongo_err) {
      console.log(mongo_err);
      throw new Error(Definer.follow_err2);
    }
  }

  async modifyMemberFollowCounts(mb_id, type, modifier) {
    try {
      if (type === "follow_change") {
        await this.memberModel
          .findByIdAndUpdate(
            { _id: mb_id },
            { $inc: { mb_follow_cnt: modifier } }
          )
          .exec();
      } else if (type === "subscriber_change") {
        await this.memberModel
          .findByIdAndUpdate(
            { _id: mb_id },
            { $inc: { mb_subscriber_cnt: modifier } }
          )
          .exec();
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  // FOR UNSUBSCRIBE
  async unsubscribeData(member, data) {
    try {
      assert.ok(member._id !== data.mb_id, Definer.follow_err1);

      const subscriber_id = shapeIntoMongooseObjectId(member._id);

      const follow_id = shapeIntoMongooseObjectId(data.mb_id);

      const result = await this.followModel.findOneAndDelete({
        follow_id: follow_id,
        subscriber_id: subscriber_id,
      });
      // console.log("result>>>", result);

      assert.ok(result, Definer.general_err2);

      await this.modifyMemberFollowCounts(follow_id, "subscriber_change", -1);
      await this.modifyMemberFollowCounts(subscriber_id, "follow_change", -1);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async getMemberFollowingsData(inquiry) {
    try {
      // console.log("query>>>", inquiry);
      const subscriber_id = shapeIntoMongooseObjectId(inquiry.mb_id);

      const page = inquiry.page * 1;
      const limit = inquiry.limit * 1;

      const result = await this.followModel
        .aggregate([
          { $match: { subscriber_id: subscriber_id } },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: "members",
              localField: "follow_id",
              foreignField: "_id",
              as: "follow_member_data",
            },
          },
          { $unwind: "$follow_member_data" },
        ])
        .exec();
      assert.ok(result, Definer.follow_err3);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getMemberFollowersData(member, inquiry) {
    try {
      const follow_id = shapeIntoMongooseObjectId(inquiry.mb_id);
      // bizga endi follow_id kk. (inquiry ichidan mb_id)ni olamiz
      // buni FOLLOWS degan collectiondan izlaymiz
      // Biz ko'rsatgan mb_id = follow_id b-i kk.
      // Shu mb_idga subscriber-follow qilgan userlarni topmoqchimiz

      const page = inquiry.page * 1;
      const limit = inquiry.limit * 1;

      let aggregateQuery = [
        { $match: { follow_id: follow_id } }, // follow_id = b-i kk follow_id ga
        { $sort: { createdAt: -1 } }, // eng oxiridan boshlab chiqar, degani
        { $skip: (page - 1) * limit }, //
        { $limit: limit },
        {
          $lookup: {
            from: "members", // yana MEMBERS col-tion dan izla deyapmiz
            localField: "subscriber_id", // LocalFieldan nimani topish kk?
            // matching orqali query qib qidirgandagi => subscriber_id ni olsin
            foreignField: "_id", // yana MEMBERS col-tion dan _id ni izla deyapmiz
            as: "subscriber_member_data", // shunaqa nomlab oldik
          },
        },
        // LOOKUP codelarida result ARRAY orqali keladi
        // subscriber_member_data ga 1ta data kelgani u-n, bizga array [] kk emas
        // shuni chun $unwind bn u arrayni olib tashayapmiz, tushirib qoldiryapmiz
        { $unwind: "$subscriber_member_data" },
      ];

      // qo'shimcha mantiq-condition ni yozamiz:
      // men subscriberimga, FOLLOW BACK bo'lganmanmi, yo'qmi?

      // following followed back to subscriber
      // Uni qachon tekshiradi? => IF bn shart kiritaman:

      // Agar authenticated bo'lgan user (mas, damir bo'lib) req. qilayotgan b-a
      // + shu req. qilayotgan user o'zining followerlar ruyxatini req. qilayotgan b-a,
      // mantiq shuyerdan path b-i.

      // Auth-user o'zining followerlar ruyxatini req. qilayotgan payti,
      // bizga FOLLOW-BACK datani qaytarsin

      if (member && member._id === inquiry.mb_id) {
        // console.log("PASSED");
        // qo'shimcha mantiqni (LOOKUP syntaxni) config.js da yozib olamiz
        // SABABI: mantiq uzunroq b-i, va buyerni iloji boricha CLEAN saqla

        aggregateQuery.push(lookup_auth_member_following(follow_id));
      } // BU MANTIQ ===> MENGA FOLLOW QILGAN USERSGA FOLLOW-BACK QILGANMANMI?
      // men 'martin' user b-b 'damir'ga follow bo'lganman, 'damir' 'martin'ga
      // ..subscribe bo'lgan
      // lookup_auth_member_following => get Member Followers rest api ni
      // ..ishlatayotgan paytimiz aynan authenticated bo'lgan user o'zining followerlar
      // ..listini request qilganda ishga tushadigan biznes logic edi

      const result = await this.followModel.aggregate(aggregateQuery).exec();
      // aggregate u-n hamma narsani (aggregateQuery)ni yuqorida taxlab oldik,
      // Bunday oldindan yaratib olishimizga sabab: following followed back to subscriber
      // Bu mantiqni ichidagi aggregateQuery ga yana qo'shimcha condition yuklaymiz

      assert.ok(result, Definer.follow_err3);
      // natijani assert qilamiz: resultni check qil, if not follow_err3 through qilamiz

      return result;
      // return qilgan result ni, followControllerdagi res.jsondagi DATA elementigaga
      // biriktirib, json formatda response qilyapmiz
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Follow;
