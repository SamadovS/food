const MemberModel = require("../schema/member.model");
const LikeModel = require("../schema/like.model");
const ProductModel = require("../schema/product.model");
const BoArticleModel = require("../schema/bo_article.model");
const Definer = require("../lib/mistake");

class Like {
  constructor(mb_id) {
    this.likeModel = LikeModel;
    this.memberModel = MemberModel;
    this.productModel = ProductModel;
    this.boArticleModel = BoArticleModel;
    this.mb_id = mb_id;
  }

  async validateTargetItem(id, group_type) {
    try {
      let result;
      switch (group_type) {
        case "member":
          result = await this.memberModel
            .findOne({
              _id: id,
              mb_status: "ACTIVE",
            })
            .exec();
          break;

        case "product":
          result = await this.productModel
            .findOne({
              _id: id,
              product_status: "PROCESS",
            })
            .exec();
          break;

        case "community": // default -> community bo'lsin
        default:
          result = await this.boArticleModel
            .findOne({
              _id: id,
              art_status: "active",
            })
            .exec();
          break;
      }

      return !!result;
    } catch (err) {
      throw err;
    }
  }

  async checkLikeExistence(like_ref_id) {
    try {
      // LIKE ni check qilamiz 'like-model' orqali (ichidan)
      // 'findOne' metod bn 'mb_id' ni izlashimiz kk
      // 'mb_id' ni shu klassga biriktirganmiz
      // 'like_ref_id' = 'like_ref_id' ga teng b-i kk
      // 'like_ref_id' buyerda ishlashi u-n, like.model.da shaping qiganmiz

      const like = await this.likeModel
        .findOne({
          mb_id: this.mb_id,
          like_ref_id: like_ref_id,
        })
        .exec();
      console.log("like>>>", like);

      // 1-usul: return
      // Return qilsin: mavjud b-a -> true | if not -> false qaytarsin
      // return like ? true : false;

      // 2-usul: return
      return !!like;
    } catch (err) {
      throw err;
    }
  }

  // XATOLIK BERMASLIK U-N HAR IKKISINI HOSIL QIVOLISHIMIZ KK.
  // 2) Avval Like bosgan + uni olib tashlash (remove like)
  async removeMemberLike(like_ref_id, group_type) {
    try {
      const result = await this.likeModel
        .findOneAndDelete({
          like_ref_id: like_ref_id,
          mb_id: this.mb_id,
          // bu mb_id ni shu class-constructoridan olyapmiz
        })
        .exec();
      // exec() dan kn -> likes collection dagi like ni delete qilyapmiz

      // modify qil: modifier = -1, chunki like ni remove qilishi kk
      await this.modifyItemLikeCounts(like_ref_id, group_type, -1);

      return result;
    } catch (err) {
      throw err;
    }
  }

  // 1) Avval Like bosmagan + unga like bosish (insert like)
  async insertMemberLike(like_ref_id, group_type) {
    try {
      // 'like_ref_id' va 'like_group'ni "like.model" dan qarab olyapmiz
      const new_like = await this.likeModel({
        mb_id: this.mb_id, // shu class constructoriga biriktirgan edik
        like_ref_id: like_ref_id,
        like_group: group_type,
      });

      // new_like ni SAVE qilish kk
      const result = await new_like.save();

      // SAVE dan keyin: LIKE lar sonini oshirish kk
      // 1ta METOD kk bo'larkan => modifyItemLikeCounts (pastda)

      // Modify target likes count
      await this.modifyItemLikeCounts(like_ref_id, group_type, 1);
      // buni resulti kk emas

      return result;
    } catch (err) {
      console.log(err);
      throw new Error(Definer.mongo_validation_err1);
    }
  }

  // Quyidagi modify metodni likelar sonini ham + increase qilishda,
  // ham - decrease qilishda ishlatamiz
  async modifyItemLikeCounts(like_ref_id, group_type, modifier) {
    // Uni ichiga 'modifier' pass qilishimiz kk + switchdan foydalanamiz
    try {
      switch (group_type) {
        case "member":
          // member b-a -> memberModel dan izlaymiz
          await this.memberModel
            .findByIdAndUpdate(
              { _id: like_ref_id },
              { $inc: { mb_likes: modifier } }
            )
            .exec();
          break;

        case "product":
          await this.productModel
            .findByIdAndUpdate(
              { _id: like_ref_id },
              { $inc: { product_likes: modifier } }
            )
            .exec();
          break;

        case "community":
          await this.boArticleModel
            .findByIdAndUpdate(
              { _id: like_ref_id },
              { $inc: { art_likes: modifier } }
            )
            .exec();
          break;
      }
      return true;
    } catch (err) {
      throw err;
    }
  }
}
module.exports = Like;
