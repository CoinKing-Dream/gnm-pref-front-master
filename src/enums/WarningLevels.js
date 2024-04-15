import _ from "lodash";
import moment from "moment";

const getDay=(mm_dd, base)=>{
  const [m,d] = mm_dd.split('/')
  return moment({'year': base.get('year'),'month': Number(m)-1,'date' : Number(d)}).format("YYYY-MM-DD")
};

const getValue= (set, base)=>{
  return base.isBetween(
    getDay(set['start'], base),
    getDay(set['end']  , base),
    null, '[]'
  )? set.value : null
};

export default {
  methods: {
    
    warningLevels(warningLines, currentDate, collBack=null) {
      
      const result=[]
      // warning要素分の繰り返し
      _.forEach(warningLines, info => {
        
        // warning要素の登録期間分の繰り返し
        const warning = _.transform(info.detals,
          (bufs, set) => {
            bufs.value = getValue(set, currentDate) || bufs.value
          }, {value:null}
        )

        // warning要素有効評価
        if (warning.value!=null) {
          if (collBack) 
            collBack({
                label:info.name,
                color:info.color,
                value: warning.value
            })
          else
            result.push({
              label:info.name,
              color:info.color,
              value: warning.value
            });
        }

      });
      if (collBack==null) return result
    }

  }
}

// export const BaseTile = {
//   STANDARD: {
//     index: 0,
//     key: "standard",
//     string: "標準地図",
//     url: `${conf.tileServer.url}/xyz/std/{z}/{x}/{y}.png`
//   },
//   PHOTO: {
//     index: 1,
//     key: "photo",
//     string: "写真地図",
//     url: `${conf.tileServer.url}/xyz/seamlessphoto/{z}/{x}/{y}.jpg`
//   },
//   GRAY: {
//     index: 2,
//     key: "gray",
//     string: "淡色地図",
//     url: `${conf.tileServer.url}/xyz/pale/{z}/{x}/{y}.png`
//   },
//   WHITE: {
//     index: 3,
//     key: "white",
//     string: "白地図",
//     url: `${conf.tileServer.url}/xyz/blank/{z}/{x}/{y}.png`
//   },
//   getBaseTileFromIndex(index) {
//     return _.find(this, tile => {
//       return _.isMatch(tile, { index: index });
//     });
//   }
// };
