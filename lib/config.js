const mongoose = require("mongoose");

exports.member_type_enums = ["USER", "ADMIN", "PEDAL", "RESTAURANT"];
exports.member_status_enums = ["ONPAUSE", "ACTIVE", "DELETED"];
exports.ordernary_enums = ["Y", "N"];

exports.product_collection_enums = ["dish", "salad", "dessert", "drink", "etc"];
exports.product_status_enums = ["PAUSED", "PROCESS", "DELETED"];
exports.product_size_enums = ["small", "normal", "large", "set"];
exports.product_volume_enums = [0.5, 1, 1.25, 1.5, 2];

exports.order_status_enums = ["PAUSED", "PROCESS", "FINISHED", "DELETED"];

exports.like_view_group_list = ["product", "member", "community"];
exports.board_id_enum_list = ["celebrity", "evaluation", "story"];
exports.board_article_status_enum_list = ["active", "deleted"];

/**********************************
 *    MONGODB RELATED COMMANDS    *
 *********************************/

exports.shapeIntoMongooseObjectId = (target) => {
  if (typeof target === "string") {
    return new mongoose.Types.ObjectId(target);
  } else return target;
};
// bizga kelayotgan follow_id ni mb_id ga path qilyapmiz
exports.lookup_auth_member_following = (mb_id) => {
  return {
    $lookup: {
      from: "follows", // follows col.dan izlasin
      // buyerda oddiy lookup bo'lmaydi, variablelarni kiritamiz
      let: {
        // lc = local
        lc_follow_id: "$subscriber_id",
        // buni aggregateQuery resultidan ovoladi
        lc_subscriber_id: mb_id,
        // Nega buni teskari yozdik? SABABI teskari holatni izlayapmiz
        // 'follow' col.dagi follow_id = subscriber_id ga,
        // subscriber_id = follow_id (mb_id) ga

        // Tushunarli tilda: Menga following qilgan (subscriber im ga)
        // Men ham follow-back (subscribe) qilganmanmi?

        nw_my_following: true,
      },
      // pipeline syntaxdan foydalanamiz: u ARRAYni qabul qiladi
      // Uni ichiga MATCHING va PROJECTIONni hosil qilmoqchiman

      pipeline: [
        {
          // MATCHING UCHUN: ,

          $match: {
            $expr: {
              //maxsus syntaxdan foydalanamiz matching qilish u-n
              $and: [
                // uni ichiga maxsus bir arrayni kiritib olamiz
                // va uni ichiga shakl yozib olamiz

                // equal bo'lsin. Nima equal bo'lsin?
                // 'follow_id' => biz hosil qilgan 'lc_follow_id'
                // original: $ 1ta, biz hosil qilganga: $ 2ta quyilyapti

                // 1-solishtirish
                { $eq: ["$follow_id", "$$lc_follow_id"] },

                // 2-solishtirish
                { $eq: ["$subscriber_id", "$$lc_subscriber_id"] },
                // Shu syntaxlarda biz hosil qilgan variablelar orqali
                // 'follows' col.da 'follow_id'si 'lc_follow_id'ga va
                // 'subscriber_id'si 'lc_follow_id'ga teng ID ni matching qil dedik
              ],
            },
          },
        },

        // MATCHING qilib bo'lgach, PROJECT qilmoqchimiz: (documentation bo'yicha)

        {
          $project: {
            //ichiga nimalar yozilishini: db va doc.da ham ko'rsang b-i
            _id: 0, //
            // ... : 1 => degani "projectionga ol" degani
            subscriber_id: 1, // subscriber_id ni projectionga o'tkazsin
            follow_id: 1, // follow_id ni projectionga o'tkazsin
            my_following: "$$nw_my_following", // my_following biz kiritmaganmiz
            //testing u-n ochilgan "$$nw_my_following" ga tenglashtiramiz
          },
        },
      ],

      // "pipeline"dan kn, lookupni ichida qaysi nom bn save b-i kk?
      as: "me_followed", // men follow bo'lganman deb shart kiritamiz
    },
  };
};
