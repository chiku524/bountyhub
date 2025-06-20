var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value;
var __require = /* @__PURE__ */ ((x) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(x, {
  get: (a, b) => (typeof require < "u" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require < "u")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except2, desc12) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except2 && __defProp(to, key, { get: () => from[key], enumerable: !(desc12 = __getOwnPropDesc(from, key)) || desc12.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
));
var __publicField = (obj, key, value) => (__defNormalProp(obj, typeof key != "symbol" ? key + "" : key, value), value);

// node_modules/bcryptjs/dist/bcrypt.js
var require_bcrypt = __commonJS({
  "node_modules/bcryptjs/dist/bcrypt.js"(exports, module) {
    (function(global2, factory) {
      typeof define == "function" && define.amd ? define([], factory) : typeof __require == "function" && typeof module == "object" && module && module.exports ? module.exports = factory() : (global2.dcodeIO = global2.dcodeIO || {}).bcrypt = factory();
    })(exports, function() {
      "use strict";
      var bcrypt3 = {}, randomFallback = null;
      function random(len) {
        if (typeof module < "u" && module && module.exports)
          try {
            return __require("crypto").randomBytes(len);
          } catch {
          }
        try {
          var a;
          return (self.crypto || self.msCrypto).getRandomValues(a = new Uint32Array(len)), Array.prototype.slice.call(a);
        } catch {
        }
        if (!randomFallback)
          throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
        return randomFallback(len);
      }
      var randomAvailable = !1;
      try {
        random(1), randomAvailable = !0;
      } catch {
      }
      randomFallback = null, bcrypt3.setRandomFallback = function(random2) {
        randomFallback = random2;
      }, bcrypt3.genSaltSync = function(rounds, seed_length) {
        if (rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS, typeof rounds != "number")
          throw Error("Illegal arguments: " + typeof rounds + ", " + typeof seed_length);
        rounds < 4 ? rounds = 4 : rounds > 31 && (rounds = 31);
        var salt = [];
        return salt.push("$2a$"), rounds < 10 && salt.push("0"), salt.push(rounds.toString()), salt.push("$"), salt.push(base64_encode(random(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN)), salt.join("");
      }, bcrypt3.genSalt = function(rounds, seed_length, callback) {
        if (typeof seed_length == "function" && (callback = seed_length, seed_length = void 0), typeof rounds == "function" && (callback = rounds, rounds = void 0), typeof rounds > "u")
          rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
        else if (typeof rounds != "number")
          throw Error("illegal arguments: " + typeof rounds);
        function _async(callback2) {
          nextTick(function() {
            try {
              callback2(null, bcrypt3.genSaltSync(rounds));
            } catch (err) {
              callback2(err);
            }
          });
        }
        if (callback) {
          if (typeof callback != "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      }, bcrypt3.hashSync = function(s, salt) {
        if (typeof salt > "u" && (salt = GENSALT_DEFAULT_LOG2_ROUNDS), typeof salt == "number" && (salt = bcrypt3.genSaltSync(salt)), typeof s != "string" || typeof salt != "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof salt);
        return _hash(s, salt);
      }, bcrypt3.hash = function(s, salt, callback, progressCallback) {
        function _async(callback2) {
          typeof s == "string" && typeof salt == "number" ? bcrypt3.genSalt(salt, function(err, salt2) {
            _hash(s, salt2, callback2, progressCallback);
          }) : typeof s == "string" && typeof salt == "string" ? _hash(s, salt, callback2, progressCallback) : nextTick(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof salt)));
        }
        if (callback) {
          if (typeof callback != "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      function safeStringCompare(known, unknown) {
        for (var right = 0, wrong = 0, i = 0, k = known.length; i < k; ++i)
          known.charCodeAt(i) === unknown.charCodeAt(i) ? ++right : ++wrong;
        return right < 0 ? !1 : wrong === 0;
      }
      bcrypt3.compareSync = function(s, hash) {
        if (typeof s != "string" || typeof hash != "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof hash);
        return hash.length !== 60 ? !1 : safeStringCompare(bcrypt3.hashSync(s, hash.substr(0, hash.length - 31)), hash);
      }, bcrypt3.compare = function(s, hash, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s != "string" || typeof hash != "string") {
            nextTick(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof hash)));
            return;
          }
          if (hash.length !== 60) {
            nextTick(callback2.bind(this, null, !1));
            return;
          }
          bcrypt3.hash(s, hash.substr(0, 29), function(err, comp) {
            err ? callback2(err) : callback2(null, safeStringCompare(comp, hash));
          }, progressCallback);
        }
        if (callback) {
          if (typeof callback != "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      }, bcrypt3.getRounds = function(hash) {
        if (typeof hash != "string")
          throw Error("Illegal arguments: " + typeof hash);
        return parseInt(hash.split("$")[2], 10);
      }, bcrypt3.getSalt = function(hash) {
        if (typeof hash != "string")
          throw Error("Illegal arguments: " + typeof hash);
        if (hash.length !== 60)
          throw Error("Illegal hash length: " + hash.length + " != 60");
        return hash.substring(0, 29);
      };
      var nextTick = typeof process < "u" && process && typeof process.nextTick == "function" ? typeof setImmediate == "function" ? setImmediate : process.nextTick : setTimeout;
      function stringToBytes(str) {
        var out = [], i = 0;
        return utfx.encodeUTF16toUTF8(function() {
          return i >= str.length ? null : str.charCodeAt(i++);
        }, function(b) {
          out.push(b);
        }), out;
      }
      var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), BASE64_INDEX = [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        0,
        1,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        -1,
        -1,
        -1,
        -1,
        -1
      ], stringFromCharCode = String.fromCharCode;
      function base64_encode(b, len) {
        var off = 0, rs = [], c1, c2;
        if (len <= 0 || len > b.length)
          throw Error("Illegal len: " + len);
        for (; off < len; ) {
          if (c1 = b[off++] & 255, rs.push(BASE64_CODE[c1 >> 2 & 63]), c1 = (c1 & 3) << 4, off >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          if (c2 = b[off++] & 255, c1 |= c2 >> 4 & 15, rs.push(BASE64_CODE[c1 & 63]), c1 = (c2 & 15) << 2, off >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off++] & 255, c1 |= c2 >> 6 & 3, rs.push(BASE64_CODE[c1 & 63]), rs.push(BASE64_CODE[c2 & 63]);
        }
        return rs.join("");
      }
      function base64_decode(s, len) {
        var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
        if (len <= 0)
          throw Error("Illegal len: " + len);
        for (; off < slen - 1 && olen < len && (code = s.charCodeAt(off++), c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1, code = s.charCodeAt(off++), c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1, !(c1 == -1 || c2 == -1 || (o = c1 << 2 >>> 0, o |= (c2 & 48) >> 4, rs.push(stringFromCharCode(o)), ++olen >= len || off >= slen) || (code = s.charCodeAt(off++), c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1, c3 == -1) || (o = (c2 & 15) << 4 >>> 0, o |= (c3 & 60) >> 2, rs.push(stringFromCharCode(o)), ++olen >= len || off >= slen))); )
          code = s.charCodeAt(off++), c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1, o = (c3 & 3) << 6 >>> 0, o |= c4, rs.push(stringFromCharCode(o)), ++olen;
        var res = [];
        for (off = 0; off < olen; off++)
          res.push(rs[off].charCodeAt(0));
        return res;
      }
      var utfx = function() {
        "use strict";
        var utfx2 = {};
        return utfx2.MAX_CODEPOINT = 1114111, utfx2.encodeUTF8 = function(src, dst) {
          var cp = null;
          for (typeof src == "number" && (cp = src, src = function() {
            return null;
          }); cp !== null || (cp = src()) !== null; )
            cp < 128 ? dst(cp & 127) : cp < 2048 ? (dst(cp >> 6 & 31 | 192), dst(cp & 63 | 128)) : cp < 65536 ? (dst(cp >> 12 & 15 | 224), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128)) : (dst(cp >> 18 & 7 | 240), dst(cp >> 12 & 63 | 128), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128)), cp = null;
        }, utfx2.decodeUTF8 = function(src, dst) {
          for (var a, b, c, d, fail = function(b2) {
            b2 = b2.slice(0, b2.indexOf(null));
            var err = Error(b2.toString());
            throw err.name = "TruncatedError", err.bytes = b2, err;
          }; (a = src()) !== null; )
            if (!(a & 128))
              dst(a);
            else if ((a & 224) === 192)
              (b = src()) === null && fail([a, b]), dst((a & 31) << 6 | b & 63);
            else if ((a & 240) === 224)
              ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 15) << 12 | (b & 63) << 6 | c & 63);
            else if ((a & 248) === 240)
              ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63);
            else
              throw RangeError("Illegal starting byte: " + a);
        }, utfx2.UTF16toUTF8 = function(src, dst) {
          for (var c1, c2 = null; (c1 = c2 !== null ? c2 : src()) !== null; ) {
            if (c1 >= 55296 && c1 <= 57343 && (c2 = src()) !== null && c2 >= 56320 && c2 <= 57343) {
              dst((c1 - 55296) * 1024 + c2 - 56320 + 65536), c2 = null;
              continue;
            }
            dst(c1);
          }
          c2 !== null && dst(c2);
        }, utfx2.UTF8toUTF16 = function(src, dst) {
          var cp = null;
          for (typeof src == "number" && (cp = src, src = function() {
            return null;
          }); cp !== null || (cp = src()) !== null; )
            cp <= 65535 ? dst(cp) : (cp -= 65536, dst((cp >> 10) + 55296), dst(cp % 1024 + 56320)), cp = null;
        }, utfx2.encodeUTF16toUTF8 = function(src, dst) {
          utfx2.UTF16toUTF8(src, function(cp) {
            utfx2.encodeUTF8(cp, dst);
          });
        }, utfx2.decodeUTF8toUTF16 = function(src, dst) {
          utfx2.decodeUTF8(src, function(cp) {
            utfx2.UTF8toUTF16(cp, dst);
          });
        }, utfx2.calculateCodePoint = function(cp) {
          return cp < 128 ? 1 : cp < 2048 ? 2 : cp < 65536 ? 3 : 4;
        }, utfx2.calculateUTF8 = function(src) {
          for (var cp, l = 0; (cp = src()) !== null; )
            l += utfx2.calculateCodePoint(cp);
          return l;
        }, utfx2.calculateUTF16asUTF8 = function(src) {
          var n = 0, l = 0;
          return utfx2.UTF16toUTF8(src, function(cp) {
            ++n, l += utfx2.calculateCodePoint(cp);
          }), [n, l];
        }, utfx2;
      }();
      Date.now = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      var BCRYPT_SALT_LEN = 16, GENSALT_DEFAULT_LOG2_ROUNDS = 10, BLOWFISH_NUM_ROUNDS = 16, MAX_EXECUTION_TIME = 100, P_ORIG = [
        608135816,
        2242054355,
        320440878,
        57701188,
        2752067618,
        698298832,
        137296536,
        3964562569,
        1160258022,
        953160567,
        3193202383,
        887688300,
        3232508343,
        3380367581,
        1065670069,
        3041331479,
        2450970073,
        2306472731
      ], S_ORIG = [
        3509652390,
        2564797868,
        805139163,
        3491422135,
        3101798381,
        1780907670,
        3128725573,
        4046225305,
        614570311,
        3012652279,
        134345442,
        2240740374,
        1667834072,
        1901547113,
        2757295779,
        4103290238,
        227898511,
        1921955416,
        1904987480,
        2182433518,
        2069144605,
        3260701109,
        2620446009,
        720527379,
        3318853667,
        677414384,
        3393288472,
        3101374703,
        2390351024,
        1614419982,
        1822297739,
        2954791486,
        3608508353,
        3174124327,
        2024746970,
        1432378464,
        3864339955,
        2857741204,
        1464375394,
        1676153920,
        1439316330,
        715854006,
        3033291828,
        289532110,
        2706671279,
        2087905683,
        3018724369,
        1668267050,
        732546397,
        1947742710,
        3462151702,
        2609353502,
        2950085171,
        1814351708,
        2050118529,
        680887927,
        999245976,
        1800124847,
        3300911131,
        1713906067,
        1641548236,
        4213287313,
        1216130144,
        1575780402,
        4018429277,
        3917837745,
        3693486850,
        3949271944,
        596196993,
        3549867205,
        258830323,
        2213823033,
        772490370,
        2760122372,
        1774776394,
        2652871518,
        566650946,
        4142492826,
        1728879713,
        2882767088,
        1783734482,
        3629395816,
        2517608232,
        2874225571,
        1861159788,
        326777828,
        3124490320,
        2130389656,
        2716951837,
        967770486,
        1724537150,
        2185432712,
        2364442137,
        1164943284,
        2105845187,
        998989502,
        3765401048,
        2244026483,
        1075463327,
        1455516326,
        1322494562,
        910128902,
        469688178,
        1117454909,
        936433444,
        3490320968,
        3675253459,
        1240580251,
        122909385,
        2157517691,
        634681816,
        4142456567,
        3825094682,
        3061402683,
        2540495037,
        79693498,
        3249098678,
        1084186820,
        1583128258,
        426386531,
        1761308591,
        1047286709,
        322548459,
        995290223,
        1845252383,
        2603652396,
        3431023940,
        2942221577,
        3202600964,
        3727903485,
        1712269319,
        422464435,
        3234572375,
        1170764815,
        3523960633,
        3117677531,
        1434042557,
        442511882,
        3600875718,
        1076654713,
        1738483198,
        4213154764,
        2393238008,
        3677496056,
        1014306527,
        4251020053,
        793779912,
        2902807211,
        842905082,
        4246964064,
        1395751752,
        1040244610,
        2656851899,
        3396308128,
        445077038,
        3742853595,
        3577915638,
        679411651,
        2892444358,
        2354009459,
        1767581616,
        3150600392,
        3791627101,
        3102740896,
        284835224,
        4246832056,
        1258075500,
        768725851,
        2589189241,
        3069724005,
        3532540348,
        1274779536,
        3789419226,
        2764799539,
        1660621633,
        3471099624,
        4011903706,
        913787905,
        3497959166,
        737222580,
        2514213453,
        2928710040,
        3937242737,
        1804850592,
        3499020752,
        2949064160,
        2386320175,
        2390070455,
        2415321851,
        4061277028,
        2290661394,
        2416832540,
        1336762016,
        1754252060,
        3520065937,
        3014181293,
        791618072,
        3188594551,
        3933548030,
        2332172193,
        3852520463,
        3043980520,
        413987798,
        3465142937,
        3030929376,
        4245938359,
        2093235073,
        3534596313,
        375366246,
        2157278981,
        2479649556,
        555357303,
        3870105701,
        2008414854,
        3344188149,
        4221384143,
        3956125452,
        2067696032,
        3594591187,
        2921233993,
        2428461,
        544322398,
        577241275,
        1471733935,
        610547355,
        4027169054,
        1432588573,
        1507829418,
        2025931657,
        3646575487,
        545086370,
        48609733,
        2200306550,
        1653985193,
        298326376,
        1316178497,
        3007786442,
        2064951626,
        458293330,
        2589141269,
        3591329599,
        3164325604,
        727753846,
        2179363840,
        146436021,
        1461446943,
        4069977195,
        705550613,
        3059967265,
        3887724982,
        4281599278,
        3313849956,
        1404054877,
        2845806497,
        146425753,
        1854211946,
        1266315497,
        3048417604,
        3681880366,
        3289982499,
        290971e4,
        1235738493,
        2632868024,
        2414719590,
        3970600049,
        1771706367,
        1449415276,
        3266420449,
        422970021,
        1963543593,
        2690192192,
        3826793022,
        1062508698,
        1531092325,
        1804592342,
        2583117782,
        2714934279,
        4024971509,
        1294809318,
        4028980673,
        1289560198,
        2221992742,
        1669523910,
        35572830,
        157838143,
        1052438473,
        1016535060,
        1802137761,
        1753167236,
        1386275462,
        3080475397,
        2857371447,
        1040679964,
        2145300060,
        2390574316,
        1461121720,
        2956646967,
        4031777805,
        4028374788,
        33600511,
        2920084762,
        1018524850,
        629373528,
        3691585981,
        3515945977,
        2091462646,
        2486323059,
        586499841,
        988145025,
        935516892,
        3367335476,
        2599673255,
        2839830854,
        265290510,
        3972581182,
        2759138881,
        3795373465,
        1005194799,
        847297441,
        406762289,
        1314163512,
        1332590856,
        1866599683,
        4127851711,
        750260880,
        613907577,
        1450815602,
        3165620655,
        3734664991,
        3650291728,
        3012275730,
        3704569646,
        1427272223,
        778793252,
        1343938022,
        2676280711,
        2052605720,
        1946737175,
        3164576444,
        3914038668,
        3967478842,
        3682934266,
        1661551462,
        3294938066,
        4011595847,
        840292616,
        3712170807,
        616741398,
        312560963,
        711312465,
        1351876610,
        322626781,
        1910503582,
        271666773,
        2175563734,
        1594956187,
        70604529,
        3617834859,
        1007753275,
        1495573769,
        4069517037,
        2549218298,
        2663038764,
        504708206,
        2263041392,
        3941167025,
        2249088522,
        1514023603,
        1998579484,
        1312622330,
        694541497,
        2582060303,
        2151582166,
        1382467621,
        776784248,
        2618340202,
        3323268794,
        2497899128,
        2784771155,
        503983604,
        4076293799,
        907881277,
        423175695,
        432175456,
        1378068232,
        4145222326,
        3954048622,
        3938656102,
        3820766613,
        2793130115,
        2977904593,
        26017576,
        3274890735,
        3194772133,
        1700274565,
        1756076034,
        4006520079,
        3677328699,
        720338349,
        1533947780,
        354530856,
        688349552,
        3973924725,
        1637815568,
        332179504,
        3949051286,
        53804574,
        2852348879,
        3044236432,
        1282449977,
        3583942155,
        3416972820,
        4006381244,
        1617046695,
        2628476075,
        3002303598,
        1686838959,
        431878346,
        2686675385,
        1700445008,
        1080580658,
        1009431731,
        832498133,
        3223435511,
        2605976345,
        2271191193,
        2516031870,
        1648197032,
        4164389018,
        2548247927,
        300782431,
        375919233,
        238389289,
        3353747414,
        2531188641,
        2019080857,
        1475708069,
        455242339,
        2609103871,
        448939670,
        3451063019,
        1395535956,
        2413381860,
        1841049896,
        1491858159,
        885456874,
        4264095073,
        4001119347,
        1565136089,
        3898914787,
        1108368660,
        540939232,
        1173283510,
        2745871338,
        3681308437,
        4207628240,
        3343053890,
        4016749493,
        1699691293,
        1103962373,
        3625875870,
        2256883143,
        3830138730,
        1031889488,
        3479347698,
        1535977030,
        4236805024,
        3251091107,
        2132092099,
        1774941330,
        1199868427,
        1452454533,
        157007616,
        2904115357,
        342012276,
        595725824,
        1480756522,
        206960106,
        497939518,
        591360097,
        863170706,
        2375253569,
        3596610801,
        1814182875,
        2094937945,
        3421402208,
        1082520231,
        3463918190,
        2785509508,
        435703966,
        3908032597,
        1641649973,
        2842273706,
        3305899714,
        1510255612,
        2148256476,
        2655287854,
        3276092548,
        4258621189,
        236887753,
        3681803219,
        274041037,
        1734335097,
        3815195456,
        3317970021,
        1899903192,
        1026095262,
        4050517792,
        356393447,
        2410691914,
        3873677099,
        3682840055,
        3913112168,
        2491498743,
        4132185628,
        2489919796,
        1091903735,
        1979897079,
        3170134830,
        3567386728,
        3557303409,
        857797738,
        1136121015,
        1342202287,
        507115054,
        2535736646,
        337727348,
        3213592640,
        1301675037,
        2528481711,
        1895095763,
        1721773893,
        3216771564,
        62756741,
        2142006736,
        835421444,
        2531993523,
        1442658625,
        3659876326,
        2882144922,
        676362277,
        1392781812,
        170690266,
        3921047035,
        1759253602,
        3611846912,
        1745797284,
        664899054,
        1329594018,
        3901205900,
        3045908486,
        2062866102,
        2865634940,
        3543621612,
        3464012697,
        1080764994,
        553557557,
        3656615353,
        3996768171,
        991055499,
        499776247,
        1265440854,
        648242737,
        3940784050,
        980351604,
        3713745714,
        1749149687,
        3396870395,
        4211799374,
        3640570775,
        1161844396,
        3125318951,
        1431517754,
        545492359,
        4268468663,
        3499529547,
        1437099964,
        2702547544,
        3433638243,
        2581715763,
        2787789398,
        1060185593,
        1593081372,
        2418618748,
        4260947970,
        69676912,
        2159744348,
        86519011,
        2512459080,
        3838209314,
        1220612927,
        3339683548,
        133810670,
        1090789135,
        1078426020,
        1569222167,
        845107691,
        3583754449,
        4072456591,
        1091646820,
        628848692,
        1613405280,
        3757631651,
        526609435,
        236106946,
        48312990,
        2942717905,
        3402727701,
        1797494240,
        859738849,
        992217954,
        4005476642,
        2243076622,
        3870952857,
        3732016268,
        765654824,
        3490871365,
        2511836413,
        1685915746,
        3888969200,
        1414112111,
        2273134842,
        3281911079,
        4080962846,
        172450625,
        2569994100,
        980381355,
        4109958455,
        2819808352,
        2716589560,
        2568741196,
        3681446669,
        3329971472,
        1835478071,
        660984891,
        3704678404,
        4045999559,
        3422617507,
        3040415634,
        1762651403,
        1719377915,
        3470491036,
        2693910283,
        3642056355,
        3138596744,
        1364962596,
        2073328063,
        1983633131,
        926494387,
        3423689081,
        2150032023,
        4096667949,
        1749200295,
        3328846651,
        309677260,
        2016342300,
        1779581495,
        3079819751,
        111262694,
        1274766160,
        443224088,
        298511866,
        1025883608,
        3806446537,
        1145181785,
        168956806,
        3641502830,
        3584813610,
        1689216846,
        3666258015,
        3200248200,
        1692713982,
        2646376535,
        4042768518,
        1618508792,
        1610833997,
        3523052358,
        4130873264,
        2001055236,
        3610705100,
        2202168115,
        4028541809,
        2961195399,
        1006657119,
        2006996926,
        3186142756,
        1430667929,
        3210227297,
        1314452623,
        4074634658,
        4101304120,
        2273951170,
        1399257539,
        3367210612,
        3027628629,
        1190975929,
        2062231137,
        2333990788,
        2221543033,
        2438960610,
        1181637006,
        548689776,
        2362791313,
        3372408396,
        3104550113,
        3145860560,
        296247880,
        1970579870,
        3078560182,
        3769228297,
        1714227617,
        3291629107,
        3898220290,
        166772364,
        1251581989,
        493813264,
        448347421,
        195405023,
        2709975567,
        677966185,
        3703036547,
        1463355134,
        2715995803,
        1338867538,
        1343315457,
        2802222074,
        2684532164,
        233230375,
        2599980071,
        2000651841,
        3277868038,
        1638401717,
        4028070440,
        3237316320,
        6314154,
        819756386,
        300326615,
        590932579,
        1405279636,
        3267499572,
        3150704214,
        2428286686,
        3959192993,
        3461946742,
        1862657033,
        1266418056,
        963775037,
        2089974820,
        2263052895,
        1917689273,
        448879540,
        3550394620,
        3981727096,
        150775221,
        3627908307,
        1303187396,
        508620638,
        2975983352,
        2726630617,
        1817252668,
        1876281319,
        1457606340,
        908771278,
        3720792119,
        3617206836,
        2455994898,
        1729034894,
        1080033504,
        976866871,
        3556439503,
        2881648439,
        1522871579,
        1555064734,
        1336096578,
        3548522304,
        2579274686,
        3574697629,
        3205460757,
        3593280638,
        3338716283,
        3079412587,
        564236357,
        2993598910,
        1781952180,
        1464380207,
        3163844217,
        3332601554,
        1699332808,
        1393555694,
        1183702653,
        3581086237,
        1288719814,
        691649499,
        2847557200,
        2895455976,
        3193889540,
        2717570544,
        1781354906,
        1676643554,
        2592534050,
        3230253752,
        1126444790,
        2770207658,
        2633158820,
        2210423226,
        2615765581,
        2414155088,
        3127139286,
        673620729,
        2805611233,
        1269405062,
        4015350505,
        3341807571,
        4149409754,
        1057255273,
        2012875353,
        2162469141,
        2276492801,
        2601117357,
        993977747,
        3918593370,
        2654263191,
        753973209,
        36408145,
        2530585658,
        25011837,
        3520020182,
        2088578344,
        530523599,
        2918365339,
        1524020338,
        1518925132,
        3760827505,
        3759777254,
        1202760957,
        3985898139,
        3906192525,
        674977740,
        4174734889,
        2031300136,
        2019492241,
        3983892565,
        4153806404,
        3822280332,
        352677332,
        2297720250,
        60907813,
        90501309,
        3286998549,
        1016092578,
        2535922412,
        2839152426,
        457141659,
        509813237,
        4120667899,
        652014361,
        1966332200,
        2975202805,
        55981186,
        2327461051,
        676427537,
        3255491064,
        2882294119,
        3433927263,
        1307055953,
        942726286,
        933058658,
        2468411793,
        3933900994,
        4215176142,
        1361170020,
        2001714738,
        2830558078,
        3274259782,
        1222529897,
        1679025792,
        2729314320,
        3714953764,
        1770335741,
        151462246,
        3013232138,
        1682292957,
        1483529935,
        471910574,
        1539241949,
        458788160,
        3436315007,
        1807016891,
        3718408830,
        978976581,
        1043663428,
        3165965781,
        1927990952,
        4200891579,
        2372276910,
        3208408903,
        3533431907,
        1412390302,
        2931980059,
        4132332400,
        1947078029,
        3881505623,
        4168226417,
        2941484381,
        1077988104,
        1320477388,
        886195818,
        18198404,
        3786409e3,
        2509781533,
        112762804,
        3463356488,
        1866414978,
        891333506,
        18488651,
        661792760,
        1628790961,
        3885187036,
        3141171499,
        876946877,
        2693282273,
        1372485963,
        791857591,
        2686433993,
        3759982718,
        3167212022,
        3472953795,
        2716379847,
        445679433,
        3561995674,
        3504004811,
        3574258232,
        54117162,
        3331405415,
        2381918588,
        3769707343,
        4154350007,
        1140177722,
        4074052095,
        668550556,
        3214352940,
        367459370,
        261225585,
        2610173221,
        4209349473,
        3468074219,
        3265815641,
        314222801,
        3066103646,
        3808782860,
        282218597,
        3406013506,
        3773591054,
        379116347,
        1285071038,
        846784868,
        2669647154,
        3771962079,
        3550491691,
        2305946142,
        453669953,
        1268987020,
        3317592352,
        3279303384,
        3744833421,
        2610507566,
        3859509063,
        266596637,
        3847019092,
        517658769,
        3462560207,
        3443424879,
        370717030,
        4247526661,
        2224018117,
        4143653529,
        4112773975,
        2788324899,
        2477274417,
        1456262402,
        2901442914,
        1517677493,
        1846949527,
        2295493580,
        3734397586,
        2176403920,
        1280348187,
        1908823572,
        3871786941,
        846861322,
        1172426758,
        3287448474,
        3383383037,
        1655181056,
        3139813346,
        901632758,
        1897031941,
        2986607138,
        3066810236,
        3447102507,
        1393639104,
        373351379,
        950779232,
        625454576,
        3124240540,
        4148612726,
        2007998917,
        544563296,
        2244738638,
        2330496472,
        2058025392,
        1291430526,
        424198748,
        50039436,
        29584100,
        3605783033,
        2429876329,
        2791104160,
        1057563949,
        3255363231,
        3075367218,
        3463963227,
        1469046755,
        985887462
      ], C_ORIG = [
        1332899944,
        1700884034,
        1701343084,
        1684370003,
        1668446532,
        1869963892
      ];
      function _encipher(lr, off, P, S) {
        var n, l = lr[off], r = lr[off + 1];
        return l ^= P[0], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[1], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[2], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[3], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[4], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[5], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[6], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[7], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[8], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[9], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[10], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[11], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[12], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[13], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[14], n = S[l >>> 24], n += S[256 | l >> 16 & 255], n ^= S[512 | l >> 8 & 255], n += S[768 | l & 255], r ^= n ^ P[15], n = S[r >>> 24], n += S[256 | r >> 16 & 255], n ^= S[512 | r >> 8 & 255], n += S[768 | r & 255], l ^= n ^ P[16], lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1], lr[off + 1] = l, lr;
      }
      function _streamtoword(data, offp) {
        for (var i = 0, word = 0; i < 4; ++i)
          word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
        return { key: word, offp };
      }
      function _key(key, P, S) {
        for (var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw, i = 0; i < plen; i++)
          sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
        for (i = 0; i < plen; i += 2)
          lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      function _ekskey(data, key, P, S) {
        for (var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw, i = 0; i < plen; i++)
          sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
        for (offp = 0, i = 0; i < plen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      function _crypt(b, salt, rounds, callback, progressCallback) {
        var cdata = C_ORIG.slice(), clen = cdata.length, err;
        if (rounds < 4 || rounds > 31)
          if (err = Error("Illegal number of rounds (4-31): " + rounds), callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        if (salt.length !== BCRYPT_SALT_LEN)
          if (err = Error("Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN), callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        rounds = 1 << rounds >>> 0;
        var P, S, i = 0, j;
        Int32Array ? (P = new Int32Array(P_ORIG), S = new Int32Array(S_ORIG)) : (P = P_ORIG.slice(), S = S_ORIG.slice()), _ekskey(salt, b, P, S);
        function next() {
          if (progressCallback && progressCallback(i / rounds), i < rounds)
            for (var start = Date.now(); i < rounds && (i = i + 1, _key(b, P, S), _key(salt, P, S), !(Date.now() - start > MAX_EXECUTION_TIME)); )
              ;
          else {
            for (i = 0; i < 64; i++)
              for (j = 0; j < clen >> 1; j++)
                _encipher(cdata, j << 1, P, S);
            var ret = [];
            for (i = 0; i < clen; i++)
              ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
            if (callback) {
              callback(null, ret);
              return;
            } else
              return ret;
          }
          callback && nextTick(next);
        }
        if (typeof callback < "u")
          next();
        else
          for (var res; ; )
            if (typeof (res = next()) < "u")
              return res || [];
      }
      function _hash(s, salt, callback, progressCallback) {
        var err;
        if (typeof s != "string" || typeof salt != "string")
          if (err = Error("Invalid string / salt: Not a string"), callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        var minor, offset;
        if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2")
          if (err = Error("Invalid salt version: " + salt.substring(0, 2)), callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        if (salt.charAt(2) === "$")
          minor = String.fromCharCode(0), offset = 3;
        else {
          if (minor = salt.charAt(2), minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$")
            if (err = Error("Invalid salt revision: " + salt.substring(2, 4)), callback) {
              nextTick(callback.bind(this, err));
              return;
            } else
              throw err;
          offset = 4;
        }
        if (salt.charAt(offset + 2) > "$")
          if (err = Error("Missing salt rounds"), callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
        s += minor >= "a" ? "\0" : "";
        var passwordb = stringToBytes(s), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
        function finish(bytes) {
          var res = [];
          return res.push("$2"), minor >= "a" && res.push(minor), res.push("$"), rounds < 10 && res.push("0"), res.push(rounds.toString()), res.push("$"), res.push(base64_encode(saltb, saltb.length)), res.push(base64_encode(bytes, C_ORIG.length * 4 - 1)), res.join("");
        }
        if (typeof callback > "u")
          return finish(_crypt(passwordb, saltb, rounds));
        _crypt(passwordb, saltb, rounds, function(err2, bytes) {
          err2 ? callback(err2, null) : callback(null, finish(bytes));
        }, progressCallback);
      }
      return bcrypt3.encodeBase64 = base64_encode, bcrypt3.decodeBase64 = base64_decode, bcrypt3;
    });
  }
});

// node_modules/bcryptjs/index.js
var require_bcryptjs = __commonJS({
  "node_modules/bcryptjs/index.js"(exports, module) {
    module.exports = require_bcrypt();
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  answers: () => answers,
  bookmarks: () => bookmarks,
  bounties: () => bounties,
  bountyClaims: () => bountyClaims,
  codeBlocks: () => codeBlocks,
  comments: () => comments,
  integrityHistory: () => integrityHistory,
  integrityRatings: () => integrityRatings,
  integrityViolations: () => integrityViolations,
  media: () => media,
  postTags: () => postTags,
  posts: () => posts,
  profiles: () => profiles,
  refundRequestVotes: () => refundRequestVotes,
  refundRequests: () => refundRequests,
  reports: () => reports,
  reputationHistory: () => reputationHistory,
  schema: () => schema,
  tags: () => tags,
  transactionLogs: () => transactionLogs,
  userRatings: () => userRatings,
  users: () => users,
  virtualWallets: () => virtualWallets,
  votes: () => votes,
  walletTransactions: () => walletTransactions
});
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
var users, profiles, posts, media, comments, answers, votes, codeBlocks, reputationHistory, bounties, virtualWallets, walletTransactions, transactionLogs, userRatings, integrityViolations, integrityHistory, tags, postTags, bookmarks, refundRequests, refundRequestVotes, reports, bountyClaims, integrityRatings, schema, init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = sqliteTable("users", {
      id: text("id").primaryKey(),
      email: text("email").notNull().unique(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      solanaAddress: text("solana_address").unique(),
      tokenAccountAddress: text("token_account_address"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      reputationPoints: integer("reputation_points").notNull().default(0),
      integrityScore: real("integrity_score").notNull().default(5),
      totalRatings: integer("total_ratings").notNull().default(0)
    }), profiles = sqliteTable("profiles", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
      firstName: text("first_name"),
      lastName: text("last_name"),
      profilePicture: text("profile_picture"),
      bio: text("bio"),
      location: text("location"),
      website: text("website"),
      facebook: text("facebook"),
      twitter: text("twitter"),
      instagram: text("instagram"),
      linkedin: text("linkedin"),
      github: text("github"),
      youtube: text("youtube"),
      tiktok: text("tiktok"),
      discord: text("discord"),
      reddit: text("reddit"),
      medium: text("medium"),
      stackoverflow: text("stackoverflow"),
      devto: text("devto"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), posts = sqliteTable("posts", {
      id: text("id").primaryKey(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      visibilityVotes: integer("visibility_votes").notNull().default(0),
      qualityUpvotes: integer("quality_upvotes").notNull().default(0),
      qualityDownvotes: integer("quality_downvotes").notNull().default(0),
      hasBounty: integer("has_bounty", { mode: "boolean" }).notNull().default(!1),
      status: text("status", { enum: ["OPEN", "CLOSED", "COMPLETED"] }).notNull().default("OPEN")
    }), media = sqliteTable("media", {
      id: text("id").primaryKey(),
      type: text("type").notNull(),
      // IMAGE, VIDEO, AUDIO
      url: text("url").notNull(),
      thumbnailUrl: text("thumbnail_url"),
      isScreenRecording: integer("is_screen_recording", { mode: "boolean" }).notNull().default(!1),
      cloudinaryId: text("cloudinary_id").notNull(),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), comments = sqliteTable("comments", {
      id: text("id").primaryKey(),
      content: text("content").notNull(),
      authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      answerId: text("answer_id").references(() => answers.id, { onDelete: "cascade" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      upvotes: integer("upvotes").notNull().default(0),
      downvotes: integer("downvotes").notNull().default(0)
    }), answers = sqliteTable("answers", {
      id: text("id").primaryKey(),
      content: text("content").notNull(),
      authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      upvotes: integer("upvotes").notNull().default(0),
      downvotes: integer("downvotes").notNull().default(0),
      isAccepted: integer("is_accepted", { mode: "boolean" }).notNull().default(!1)
    }), votes = sqliteTable("votes", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
      commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
      answerId: text("answer_id").references(() => answers.id, { onDelete: "cascade" }),
      value: integer("value").notNull(),
      voteType: text("vote_type").notNull(),
      isQualityVote: integer("is_quality_vote", { mode: "boolean" }).notNull().default(!1),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), codeBlocks = sqliteTable("code_blocks", {
      id: text("id").primaryKey(),
      language: text("language").notNull(),
      code: text("code").notNull(),
      description: text("description"),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), reputationHistory = sqliteTable("reputation_history", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      points: integer("points").notNull(),
      action: text("action").notNull(),
      referenceId: text("reference_id"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), bounties = sqliteTable("bounties", {
      id: text("id").primaryKey(),
      postId: text("post_id").notNull().unique().references(() => posts.id, { onDelete: "cascade" }),
      amount: real("amount").notNull(),
      status: text("status", { enum: ["ACTIVE", "CLAIMED", "REFUNDED", "EXPIRED"] }).notNull().default("ACTIVE"),
      winnerId: text("winner_id").references(() => users.id, { onDelete: "set null" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      expiresAt: integer("expires_at", { mode: "timestamp" }),
      signature: text("signature"),
      mintAddress: text("mint_address"),
      tokenDecimals: integer("token_decimals").notNull().default(9),
      refundLockPeriod: integer("refund_lock_period").notNull().default(24),
      firstAnswerAt: integer("first_answer_at", { mode: "timestamp" }),
      refundReason: text("refund_reason"),
      refundPenalty: real("refund_penalty").notNull().default(0),
      communityFee: real("community_fee").notNull().default(0.05)
    }), virtualWallets = sqliteTable("virtual_wallets", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
      balance: real("balance").notNull().default(0),
      totalDeposited: real("total_deposited").notNull().default(0),
      totalWithdrawn: real("total_withdrawn").notNull().default(0),
      totalEarned: real("total_earned").notNull().default(0),
      totalSpent: real("total_spent").notNull().default(0),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), walletTransactions = sqliteTable("wallet_transactions", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      walletId: text("wallet_id").notNull().references(() => virtualWallets.id, { onDelete: "cascade" }),
      type: text("type", { enum: ["DEPOSIT", "WITHDRAW", "BOUNTY_CREATED", "BOUNTY_CLAIMED", "BOUNTY_REFUNDED", "BOUNTY_EARNED", "COMPENSATION"] }).notNull(),
      amount: real("amount").notNull(),
      balanceBefore: real("balance_before").notNull(),
      balanceAfter: real("balance_after").notNull(),
      description: text("description").notNull(),
      status: text("status", { enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] }).notNull().default("PENDING"),
      solanaSignature: text("solana_signature"),
      bountyId: text("bounty_id").references(() => bounties.id, { onDelete: "set null" }),
      metadata: text("metadata"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), transactionLogs = sqliteTable("transaction_logs", {
      id: text("id").primaryKey(),
      type: text("type").notNull(),
      userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      amount: real("amount").notNull(),
      transactionId: text("transaction_id").notNull(),
      timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      status: text("status").notNull(),
      metadata: text("metadata"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), userRatings = sqliteTable("user_ratings", {
      id: text("id").primaryKey(),
      raterId: text("rater_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      ratedUserId: text("rated_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      rating: integer("rating").notNull(),
      reason: text("reason").notNull(),
      context: text("context").notNull(),
      referenceId: text("reference_id"),
      referenceType: text("reference_type"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), integrityViolations = sqliteTable("integrity_violations", {
      id: text("id").primaryKey(),
      reporterId: text("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      targetUserId: text("target_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      violationType: text("violation_type").notNull(),
      description: text("description").notNull(),
      evidence: text("evidence"),
      referenceId: text("reference_id"),
      referenceType: text("reference_type"),
      status: text("status", { enum: ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"] }).notNull().default("PENDING"),
      moderatorNotes: text("moderator_notes"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), integrityHistory = sqliteTable("integrity_history", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      action: text("action").notNull(),
      points: integer("points").notNull(),
      description: text("description").notNull(),
      referenceId: text("reference_id"),
      referenceType: text("reference_type"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), tags = sqliteTable("tags", {
      id: text("id").primaryKey(),
      name: text("name").notNull().unique(),
      description: text("description"),
      color: text("color").notNull().default("#8B5CF6"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), postTags = sqliteTable("post_tags", {
      id: text("id").primaryKey(),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" })
    }), bookmarks = sqliteTable("bookmarks", {
      id: text("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), refundRequests = sqliteTable("refund_requests", {
      id: text("id").primaryKey(),
      bountyId: text("bounty_id").notNull().references(() => bounties.id, { onDelete: "cascade" }),
      requesterId: text("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      reason: text("reason").notNull(),
      status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED", "EXPIRED"] }).notNull().default("PENDING"),
      communityVotes: integer("community_votes").notNull().default(0),
      requiredVotes: integer("required_votes").notNull().default(5),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
    }), refundRequestVotes = sqliteTable("refund_request_votes", {
      id: text("id").primaryKey(),
      refundRequestId: text("refund_request_id").notNull().references(() => refundRequests.id, { onDelete: "cascade" }),
      voterId: text("voter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      vote: integer("vote", { mode: "boolean" }).notNull(),
      reason: text("reason"),
      rewardAmount: real("reward_amount").notNull().default(0),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), reports = sqliteTable("reports", {
      id: text("id").primaryKey(),
      reporterId: text("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: text("post_id").references(() => posts.id, { onDelete: "cascade" }),
      commentId: text("comment_id").references(() => comments.id, { onDelete: "cascade" }),
      answerId: text("answer_id").references(() => answers.id, { onDelete: "cascade" }),
      reason: text("reason").notNull(),
      status: text("status", { enum: ["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"] }).notNull().default("PENDING"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), bountyClaims = sqliteTable("bounty_claims", {
      id: text("id").primaryKey(),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      answerId: text("answer_id").notNull().references(() => answers.id, { onDelete: "cascade" }),
      claimantId: text("claimant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      amount: real("amount").notNull(),
      status: text("status", { enum: ["PENDING", "APPROVED", "REJECTED"] }).notNull().default("PENDING"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), integrityRatings = sqliteTable("integrity_ratings", {
      id: text("id").primaryKey(),
      raterId: text("rater_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
      rating: integer("rating").notNull(),
      reason: text("reason").notNull(),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
    }), schema = {
      users,
      profiles,
      posts,
      media,
      comments,
      answers,
      votes,
      codeBlocks,
      reputationHistory,
      bounties,
      virtualWallets,
      walletTransactions,
      transactionLogs,
      userRatings,
      integrityViolations,
      integrityHistory,
      tags,
      postTags,
      bookmarks,
      refundRequests,
      refundRequestVotes,
      reports,
      bountyClaims,
      integrityRatings
    };
  }
});

// bounty-bucks-info.json
var bounty_bucks_info_default, init_bounty_bucks_info = __esm({
  "bounty-bucks-info.json"() {
    bounty_bucks_info_default = {
      name: "BountyBucks",
      symbol: "BBUX",
      mint: "8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M",
      description: "BountyBucks (BBUX) is the native token for Portal's revolutionary decentralized bounty platform. Built on Solana, BBUX powers a hybrid virtual/real token model with innovative staking pools and an integrity rating system. Earn BBUX by completing bounties, stake for rewards, and participate in platform governance. The future of decentralized bounty platforms starts here.",
      image: "https://bountybucks.vercel.app/logo.svg",
      external_url: "https://bountybucks.vercel.app/",
      attributes: [
        { trait_type: "Token Type", value: "Utility Token" },
        { trait_type: "Blockchain", value: "Solana" },
        { trait_type: "Total Supply", value: "1,000,000,000 BBUX" },
        { trait_type: "Decimals", value: "9" },
        { trait_type: "Use Case", value: "Bounty Platform Rewards" },
        { trait_type: "Features", value: "Staking, Governance, Liquidity Pools" },
        { trait_type: "Platform", value: "Portal Bounty Platform" }
      ],
      properties: {
        files: [
          { type: "image/svg+xml", uri: "https://bountybucks.vercel.app/logo.svg" }
        ],
        category: "image",
        creators: [
          { address: "e6EdfgpEdo48zUKFC18cADxTqgbt68JE8uDjAgdCzkp", share: 100 }
        ]
      },
      extensions: {
        website: "https://bountybucks.vercel.app/",
        twitter: "https://twitter.com/BountyBucks524",
        discord: "https://discord.gg/9uwHxMP9mz",
        email: "bountybucks524@gmail.com",
        github: "https://github.com/chiku524/bountybucks",
        whitepaper: "https://bountybucks.vercel.app/whitepaper.pdf"
      },
      tags: [
        "bounty",
        "defi",
        "solana",
        "staking",
        "governance",
        "developer-tools",
        "freelance",
        "rewards"
      ]
    };
  }
});

// app/utils/virtual-wallet.server.ts
var virtual_wallet_server_exports = {};
__export(virtual_wallet_server_exports, {
  addCompensation: () => addCompensation,
  cancelTransaction: () => cancelTransaction,
  claimBounty: () => claimBounty,
  confirmDeposit: () => confirmDeposit,
  confirmWithdrawal: () => confirmWithdrawal,
  createBounty: () => createBounty,
  createDepositRequest: () => createDepositRequest,
  createVirtualWallet: () => createVirtualWallet,
  createWithdrawalRequest: () => createWithdrawalRequest,
  getAllTransactions: () => getAllTransactions,
  getPendingTransactions: () => getPendingTransactions,
  getTransactionById: () => getTransactionById,
  getVirtualWallet: () => getVirtualWallet,
  getWalletDetails: () => getWalletDetails,
  getWalletTransactions: () => getWalletTransactions,
  refundBounty: () => refundBounty,
  updateWalletBalance: () => updateWalletBalance
});
import { eq as eq4, and as and3, desc as desc4, sql as sql5 } from "drizzle-orm";
async function getVirtualWallet(db, userId) {
  try {
    return await db.query.virtualWallets.findFirst({
      where: eq4(virtualWallets.userId, userId)
    }) || null;
  } catch (error) {
    return console.error("Error getting virtual wallet:", error), null;
  }
}
async function createVirtualWallet(db, userId) {
  try {
    let [wallet] = await db.insert(virtualWallets).values({
      id: crypto.randomUUID(),
      userId,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      totalSpent: 0
    }).returning().all();
    return wallet;
  } catch (error) {
    return console.error("Error creating virtual wallet:", error), null;
  }
}
async function updateWalletBalance(db, userId, amount, transactionType, description, metadata) {
  try {
    let wallet = await getVirtualWallet(db, userId);
    if (!wallet)
      return console.error("Wallet not found for user:", userId), !1;
    let balanceBefore = wallet.balance, balanceAfter = balanceBefore;
    switch (transactionType) {
      case "DEPOSIT":
        balanceAfter = balanceBefore + amount;
        break;
      case "WITHDRAW":
        if (balanceBefore < amount)
          return console.error("Insufficient balance for withdrawal"), !1;
        balanceAfter = balanceBefore - amount;
        break;
      case "BOUNTY_CREATED":
        if (balanceBefore < amount)
          return console.error("Insufficient balance for bounty creation"), !1;
        balanceAfter = balanceBefore - amount;
        break;
      case "BOUNTY_CLAIMED":
      case "BOUNTY_EARNED":
      case "COMPENSATION":
        balanceAfter = balanceBefore + amount;
        break;
      case "BOUNTY_REFUNDED":
        balanceAfter = balanceBefore + amount;
        break;
      default:
        return console.error("Invalid transaction type:", transactionType), !1;
    }
    return await db.update(virtualWallets).set({
      balance: balanceAfter,
      totalDeposited: transactionType === "DEPOSIT" ? wallet.totalDeposited + amount : wallet.totalDeposited,
      totalWithdrawn: transactionType === "WITHDRAW" ? wallet.totalWithdrawn + amount : wallet.totalWithdrawn,
      totalEarned: ["BOUNTY_CLAIMED", "BOUNTY_EARNED", "COMPENSATION"].includes(transactionType) ? wallet.totalEarned + amount : wallet.totalEarned,
      totalSpent: ["BOUNTY_CREATED", "WITHDRAW"].includes(transactionType) ? wallet.totalSpent + amount : wallet.totalSpent
    }).where(eq4(virtualWallets.userId, userId)).run(), await db.insert(walletTransactions).values({
      id: crypto.randomUUID(),
      userId,
      walletId: wallet.id,
      type: transactionType,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      status: "COMPLETED",
      metadata: metadata ? JSON.stringify(metadata) : void 0
    }).run(), !0;
  } catch (error) {
    return console.error("Error updating wallet balance:", error), !1;
  }
}
async function getWalletTransactions(db, userId, limit = 50, offset = 0) {
  try {
    return await db.query.walletTransactions.findMany({
      where: eq4(walletTransactions.userId, userId),
      orderBy: [desc4(walletTransactions.createdAt)],
      limit,
      offset
    });
  } catch (error) {
    return console.error("Error getting wallet transactions:", error), [];
  }
}
async function getTransactionById(db, transactionId) {
  try {
    return await db.query.walletTransactions.findFirst({
      where: eq4(walletTransactions.id, transactionId)
    }) || null;
  } catch (error) {
    return console.error("Error getting transaction by ID:", error), null;
  }
}
async function cancelTransaction(db, transactionId) {
  try {
    let transaction = await getTransactionById(db, transactionId);
    if (!transaction || transaction.status !== "PENDING")
      return !1;
    let reverseAmount = transaction.amount, reverseType = transaction.type === "DEPOSIT" ? "WITHDRAW" : transaction.type === "WITHDRAW" ? "DEPOSIT" : transaction.type, success = await updateWalletBalance(
      db,
      transaction.userId,
      reverseAmount,
      reverseType,
      `Cancelled: ${transaction.description}`
    );
    return success && await db.update(walletTransactions).set({ status: "CANCELLED" }).where(eq4(walletTransactions.id, transactionId)).run(), success;
  } catch (error) {
    return console.error("Error cancelling transaction:", error), !1;
  }
}
async function getWalletDetails(db, userId) {
  let wallet = await getVirtualWallet(db, userId), transactions = await getWalletTransactions(db, userId, 5);
  return { wallet, transactions };
}
async function getAllTransactions(db, userId, page = 1, limit = 50) {
  let wallet = await getVirtualWallet(db, userId), offset = (page - 1) * limit, [transactions, totalCountResult] = await Promise.all([
    getWalletTransactions(db, userId, limit, offset),
    db.select({ count: sql5`count(*)` }).from(walletTransactions).where(eq4(walletTransactions.userId, userId)).get()
  ]), totalCount = totalCountResult?.count || 0;
  return { transactions, totalCount, wallet };
}
async function getPendingTransactions(db, userId) {
  return await db.query.walletTransactions.findMany({
    where: and3(
      eq4(walletTransactions.userId, userId),
      eq4(walletTransactions.status, "PENDING")
    ),
    orderBy: [desc4(walletTransactions.createdAt)]
  });
}
async function createDepositRequest(db, userId, amount) {
  let wallet = await getVirtualWallet(db, userId);
  if (!wallet)
    throw new Error("Wallet not found");
  let [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet.id,
    type: "DEPOSIT",
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance,
    description: `Deposit request for ${amount} tokens`,
    status: "PENDING"
  }).returning().all();
  return transaction;
}
async function confirmDeposit(db, transactionId, solanaSignature) {
  let transaction = await getTransactionById(db, transactionId);
  if (!transaction || transaction.type !== "DEPOSIT")
    throw new Error("Invalid transaction");
  if (transaction.status !== "PENDING")
    throw new Error("Transaction already processed");
  await db.update(walletTransactions).set({
    status: "COMPLETED",
    solanaSignature
  }).where(eq4(walletTransactions.id, transactionId)).run();
  let wallet = await getVirtualWallet(db, transaction.userId);
  if (!wallet)
    throw new Error("Wallet not found");
  return await db.update(virtualWallets).set({
    balance: wallet.balance + transaction.amount,
    totalDeposited: wallet.totalDeposited + transaction.amount
  }).where(eq4(virtualWallets.id, wallet.id)).run(), await getTransactionById(db, transactionId);
}
async function createWithdrawalRequest(db, userId, amount, metadata) {
  let wallet = await getVirtualWallet(db, userId);
  if (!wallet || wallet.balance < amount)
    throw new Error("Insufficient balance");
  let [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet.id,
    type: "WITHDRAW",
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance - amount,
    description: `Withdrawal request for ${amount} tokens`,
    status: "PENDING",
    metadata: metadata ? JSON.stringify(metadata) : null
  }).returning().all();
  return transaction;
}
async function confirmWithdrawal(db, transactionId, solanaSignature) {
  let transaction = await getTransactionById(db, transactionId);
  if (!transaction || transaction.type !== "WITHDRAW")
    throw new Error("Invalid transaction");
  if (transaction.status !== "PENDING")
    throw new Error("Transaction already processed");
  return await db.update(walletTransactions).set({
    status: "COMPLETED",
    solanaSignature
  }).where(eq4(walletTransactions.id, transactionId)).run(), await getTransactionById(db, transactionId);
}
async function createBounty(db, userId, amount, bountyId) {
  let wallet = await getVirtualWallet(db, userId);
  if (!wallet || wallet.balance < amount)
    throw new Error("Insufficient balance to create bounty");
  let [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet.id,
    type: "BOUNTY_CREATED",
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance - amount,
    description: `Bounty created for ${amount} tokens`,
    status: "COMPLETED",
    bountyId
  }).returning().all();
  return transaction;
}
async function claimBounty(db, userId, amount, bountyId) {
  let wallet = await getVirtualWallet(db, userId), [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet?.id || "",
    type: "BOUNTY_CLAIMED",
    amount,
    balanceBefore: wallet?.balance || 0,
    balanceAfter: (wallet?.balance || 0) + amount,
    description: `Bounty claimed for ${amount} tokens`,
    status: "COMPLETED",
    bountyId
  }).returning().all();
  return transaction;
}
async function refundBounty(db, userId, amount, bountyId) {
  let wallet = await getVirtualWallet(db, userId), [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet?.id || "",
    type: "BOUNTY_REFUNDED",
    amount,
    balanceBefore: wallet?.balance || 0,
    balanceAfter: (wallet?.balance || 0) + amount,
    description: `Bounty refunded for ${amount} tokens`,
    status: "COMPLETED",
    bountyId
  }).returning().all();
  return transaction;
}
async function addCompensation(db, userId, amount, reason) {
  let wallet = await getVirtualWallet(db, userId), [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet?.id || "",
    type: "COMPENSATION",
    amount,
    balanceBefore: wallet?.balance || 0,
    balanceAfter: (wallet?.balance || 0) + amount,
    description: `Compensation: ${reason}`,
    status: "COMPLETED"
  }).returning().all();
  return transaction;
}
var TOKEN_SYMBOL, init_virtual_wallet_server = __esm({
  "app/utils/virtual-wallet.server.ts"() {
    "use strict";
    init_bounty_bucks_info();
    init_schema();
    TOKEN_SYMBOL = bounty_bucks_info_default.symbol;
  }
});

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  ErrorBoundary: () => ErrorBoundary,
  default: () => App,
  links: () => links,
  loader: () => loader
});
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData
} from "@remix-run/react";
import { useEffect as useEffect2 } from "react";
import { json } from "@remix-run/node";

// app/utils/auth.server.ts
var import_bcryptjs2 = __toESM(require_bcryptjs(), 1);
import { redirect, createCookieSessionStorage } from "@remix-run/node";

// app/utils/user.server.ts
var import_bcryptjs = __toESM(require_bcryptjs(), 1);

// app/utils/reputation.server.ts
init_schema();
import { eq, desc } from "drizzle-orm";
import { sql as sql2 } from "drizzle-orm";
var REPUTATION_POINTS = {
  POST_CREATED: 10,
  POST_UPVOTED: 2,
  POST_DOWNVOTED: -1,
  ANSWER_CREATED: 5,
  ANSWER_ACCEPTED: 15,
  ANSWER_UPVOTED: 2,
  ANSWER_DOWNVOTED: -1,
  COMMENT_CREATED: 1,
  COMMENT_UPVOTED: 1,
  COMMENT_DOWNVOTED: -1,
  QUALITY_UPVOTE_RECEIVED: 5,
  QUALITY_DOWNVOTE_RECEIVED: -2,
  CREATE_POST: 10
};
async function addReputationPoints(db, userId, points, action26, referenceId) {
  try {
    await db.update(users).set({
      reputationPoints: sql2`${users.reputationPoints} + ${points}`
    }).where(eq(users.id, userId)).run(), action26 && referenceId && await db.insert(reputationHistory).values({
      id: crypto.randomUUID(),
      userId,
      points,
      action: action26,
      referenceId
    }).run();
  } catch {
  }
}

// app/utils/solana-address.server.ts
init_bounty_bucks_info();
import { Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
var TOKEN_MINT = bounty_bucks_info_default.mint, SolanaAddressService = class {
  /**
   * Generate a new Solana keypair for a user
   */
  static generateUserKeypair() {
    let keypair = Keypair.generate();
    return {
      keypair,
      address: keypair.publicKey.toString()
    };
  }
  /**
   * Get the associated token account address for a user's Solana address
   */
  static async getUserTokenAccountAddress(solanaAddress) {
    let mintPubkey = new PublicKey(TOKEN_MINT), userPubkey = new PublicKey(solanaAddress);
    return (await getAssociatedTokenAddress(
      mintPubkey,
      userPubkey
    )).toString();
  }
  /**
   * Generate both Solana address and token account address for a new user
   */
  static async generateUserAddresses() {
    let { address: solanaAddress } = this.generateUserKeypair(), tokenAccountAddress = await this.getUserTokenAccountAddress(solanaAddress);
    return {
      solanaAddress,
      tokenAccountAddress
    };
  }
  /**
   * Validate a Solana address format
   */
  static isValidSolanaAddress(address) {
    try {
      return new PublicKey(address), !0;
    } catch {
      return !1;
    }
  }
};

// app/utils/user.server.ts
init_schema();
import { eq as eq2, desc as desc2 } from "drizzle-orm";
async function createUser(db, { email, password, username }) {
  let hashedPassword = await import_bcryptjs.default.hash(password, 10), { solanaAddress, tokenAccountAddress } = await SolanaAddressService.generateUserAddresses(), userId = crypto.randomUUID(), [user] = await db.insert(users).values({
    id: userId,
    email,
    password: hashedPassword,
    username,
    solanaAddress,
    tokenAccountAddress
  }).returning().all();
  return await db.insert(profiles).values({
    id: crypto.randomUUID(),
    userId: user.id,
    firstName: "",
    lastName: ""
  }).run(), await db.insert(virtualWallets).values({
    id: crypto.randomUUID(),
    userId: user.id,
    balance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalEarned: 0,
    totalSpent: 0
  }).run(), user;
}
async function getUserById(db, userId) {
  return db.query.users.findFirst({ where: eq2(users.id, userId) });
}
async function getUserByEmail(db, email) {
  return db.query.users.findFirst({ where: eq2(users.email, email) });
}
async function getUserByUsername(db, username) {
  return db.query.users.findFirst({ where: eq2(users.username, username) });
}

// app/utils/auth.server.ts
function getSessionSecret() {
  if (typeof global < "u" && global.SESSION_SECRET)
    return global.SESSION_SECRET;
  if (typeof process < "u" && process.env && process.env.SESSION_SECRET)
    return process.env.SESSION_SECRET;
  throw new Error("SESSION_SECRET must be set");
}
var storageInstance = null;
function getStorage() {
  if (!storageInstance) {
    let sessionSecret = getSessionSecret();
    storageInstance = createCookieSessionStorage({
      cookie: {
        name: "portal-session",
        secure: !0,
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: !0
      }
    });
  }
  return storageInstance;
}
async function createUserSession(userId, redirectTo) {
  let storage = getStorage(), session = await storage.getSession();
  return session.set("userId", userId), redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session)
    }
  });
}
async function register(db, { email, password, username, redirectTo = "/profile" }) {
  let existingUserByEmail = await getUserByEmail(db, email), existingUserByUsername = await getUserByUsername(db, username);
  if (existingUserByEmail)
    return { error: "User already exists with that email" };
  if (existingUserByUsername)
    return { error: "Username is already taken" };
  let newUser = await createUser(db, { email, password, username });
  return newUser ? createUserSession(newUser.id, redirectTo) : { error: "Something went wrong trying to create a new user." };
}
async function login(db, { email, password, redirectTo = "/profile" }) {
  let user = await getUserByEmail(db, email);
  return user ? await import_bcryptjs2.default.compare(password, user.password) ? createUserSession(user.id, redirectTo) : { error: "Invalid credentials" } : { error: "Invalid credentials" };
}
async function requireUserId(request, redirectTo = new URL(request.url).pathname) {
  let userId = (await getUserSession(request)).get("userId");
  if (!userId || typeof userId != "string")
    throw redirect(`/login?redirectTo=${redirectTo}`);
  return userId;
}
function getUserSession(request) {
  return getStorage().getSession(request.headers.get("Cookie"));
}
async function getUserId(request) {
  let userId = (await getUserSession(request)).get("userId");
  return !userId || typeof userId != "string" ? null : userId;
}
async function getUser(request, db) {
  let userId = await getUserId(request);
  if (!userId || typeof userId != "string")
    return null;
  try {
    return db ? await getUserById(db, userId) : null;
  } catch {
    throw logout(request);
  }
}
async function logout(request) {
  let storage = getStorage(), session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session)
    }
  });
}

// app/components/WalletProvider.tsx
import { useEffect, useState } from "react";
import { Fragment, jsx as jsx2 } from "react/jsx-runtime";
function ClientWalletProvider({ children }) {
  let [walletComponents, setWalletComponents] = useState(null), [isLoading, setIsLoading] = useState(!0);
  if (useEffect(() => {
    Promise.all([
      import("@solana/wallet-adapter-base"),
      import("@solana/wallet-adapter-react"),
      import("@solana/wallet-adapter-react-ui"),
      import("@solana/wallet-adapter-phantom"),
      import("@solana/wallet-adapter-solflare"),
      import("@solana/web3.js")
    ]).then(([
      { WalletAdapterNetwork },
      { ConnectionProvider: ConnectionProvider2, WalletProvider: SolanaWalletProvider2 },
      { WalletModalProvider: WalletModalProvider2 },
      { PhantomWalletAdapter },
      { SolflareWalletAdapter },
      { clusterApiUrl }
    ]) => {
      let wallets2 = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter()
      ];
      setWalletComponents({
        ConnectionProvider: ConnectionProvider2,
        SolanaWalletProvider: SolanaWalletProvider2,
        WalletModalProvider: WalletModalProvider2,
        wallets: wallets2,
        endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet)
      }), setIsLoading(!1);
    }).catch((error) => {
      console.error("Failed to load wallet components:", error), setIsLoading(!1);
    });
  }, []), isLoading || !walletComponents)
    return /* @__PURE__ */ jsx2(Fragment, { children });
  let { ConnectionProvider, SolanaWalletProvider, WalletModalProvider, wallets, endpoint } = walletComponents;
  return /* @__PURE__ */ jsx2(ConnectionProvider, { endpoint, children: /* @__PURE__ */ jsx2(SolanaWalletProvider, { wallets, autoConnect: !0, children: /* @__PURE__ */ jsx2(WalletModalProvider, { children }) }) });
}
function WalletProvider({ children }) {
  let [mounted, setMounted] = useState(!1);
  return useEffect(() => {
    setMounted(!0);
  }, []), typeof window > "u" ? /* @__PURE__ */ jsx2(Fragment, { children }) : mounted ? /* @__PURE__ */ jsx2(ClientWalletProvider, { children }) : /* @__PURE__ */ jsx2(Fragment, { children });
}

// node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind"), hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
  if (!value || typeof value != "object")
    return !1;
  if (value instanceof type)
    return !0;
  if (!Object.prototype.hasOwnProperty.call(type, entityKind))
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls)
    for (; cls; ) {
      if (entityKind in cls && cls[entityKind] === type[entityKind])
        return !0;
      cls = Object.getPrototypeOf(cls);
    }
  return !1;
}

// node_modules/drizzle-orm/logger.js
var _a, ConsoleLogWriter = class {
  write(message) {
    console.log(message);
  }
};
_a = entityKind, __publicField(ConsoleLogWriter, _a, "ConsoleLogWriter");
var _a2, DefaultLogger = class {
  writer;
  constructor(config) {
    this.writer = config?.writer ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    let stringifiedParams = params.map((p) => {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    }), paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
};
_a2 = entityKind, __publicField(DefaultLogger, _a2, "DefaultLogger");
var _a3, NoopLogger = class {
  logQuery() {
  }
};
_a3 = entityKind, __publicField(NoopLogger, _a3, "NoopLogger");

// node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");

// node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema"), Columns = Symbol.for("drizzle:Columns"), ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns"), OriginalName = Symbol.for("drizzle:OriginalName"), BaseName = Symbol.for("drizzle:BaseName"), IsAlias = Symbol.for("drizzle:IsAlias"), ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder"), IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable"), _a4, Table = class {
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [(_a4 = entityKind, TableName)];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /** @internal */
  [ExtraConfigColumns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = !1;
  /** @internal */
  [IsDrizzleTable] = !0;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  constructor(name, schema3, baseName) {
    this[TableName] = this[OriginalName] = name, this[Schema] = schema3, this[BaseName] = baseName;
  }
};
__publicField(Table, _a4, "Table"), /** @internal */
__publicField(Table, "Symbol", {
  Name: TableName,
  Schema,
  OriginalName,
  Columns,
  ExtraConfigColumns,
  BaseName,
  IsAlias,
  ExtraConfigBuilder
});
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}

// node_modules/drizzle-orm/column.js
var _a5, Column = class {
  constructor(table, config) {
    this.table = table, this.config = config, this.name = config.name, this.keyAsName = config.keyAsName, this.notNull = config.notNull, this.default = config.default, this.defaultFn = config.defaultFn, this.onUpdateFn = config.onUpdateFn, this.hasDefault = config.hasDefault, this.primary = config.primaryKey, this.isUnique = config.isUnique, this.uniqueName = config.uniqueName, this.uniqueType = config.uniqueType, this.dataType = config.dataType, this.columnType = config.columnType, this.generated = config.generated, this.generatedIdentity = config.generatedIdentity;
  }
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  generated = void 0;
  generatedIdentity = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
};
_a5 = entityKind, __publicField(Column, _a5, "Column");

// node_modules/drizzle-orm/column-builder.js
var _a6, ColumnBuilder = class {
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: !1,
      default: void 0,
      hasDefault: !1,
      primaryKey: !1,
      isUnique: !1,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    return this.config.notNull = !0, this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    return this.config.default = value, this.config.hasDefault = !0, this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    return this.config.defaultFn = fn, this.config.hasDefault = !0, this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    return this.config.onUpdateFn = fn, this.config.hasDefault = !0, this;
  }
  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    return this.config.primaryKey = !0, this.config.notNull = !0, this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    this.config.name === "" && (this.config.name = name);
  }
};
_a6 = entityKind, __publicField(ColumnBuilder, _a6, "ColumnBuilder");

// node_modules/drizzle-orm/pg-core/foreign-keys.js
var _a7, ForeignKeyBuilder = class {
  /** @internal */
  reference;
  /** @internal */
  _onUpdate = "no action";
  /** @internal */
  _onDelete = "no action";
  constructor(config, actions) {
    this.reference = () => {
      let { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    }, actions && (this._onUpdate = actions.onUpdate, this._onDelete = actions.onDelete);
  }
  onUpdate(action26) {
    return this._onUpdate = action26 === void 0 ? "no action" : action26, this;
  }
  onDelete(action26) {
    return this._onDelete = action26 === void 0 ? "no action" : action26, this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
};
_a7 = entityKind, __publicField(ForeignKeyBuilder, _a7, "PgForeignKeyBuilder");
var _a8, ForeignKey = class {
  constructor(table, builder) {
    this.table = table, this.reference = builder.reference, this.onUpdate = builder._onUpdate, this.onDelete = builder._onDelete;
  }
  reference;
  onUpdate;
  onDelete;
  getName() {
    let { name, columns, foreignColumns } = this.reference(), columnNames = columns.map((column) => column.name), foreignColumnNames = foreignColumns.map((column) => column.name), chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};
_a8 = entityKind, __publicField(ForeignKey, _a8, "PgForeignKey");

// node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// node_modules/drizzle-orm/pg-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var _a9, UniqueConstraintBuilder = class {
  constructor(columns, name) {
    this.name = name, this.columns = columns;
  }
  /** @internal */
  columns;
  /** @internal */
  nullsNotDistinctConfig = !1;
  nullsNotDistinct() {
    return this.nullsNotDistinctConfig = !0, this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
};
_a9 = entityKind, __publicField(UniqueConstraintBuilder, _a9, "PgUniqueConstraintBuilder");
var _a10, UniqueOnConstraintBuilder = class {
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
};
_a10 = entityKind, __publicField(UniqueOnConstraintBuilder, _a10, "PgUniqueOnConstraintBuilder");
var _a11, UniqueConstraint = class {
  constructor(table, columns, nullsNotDistinct, name) {
    this.table = table, this.columns = columns, this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name)), this.nullsNotDistinct = nullsNotDistinct;
  }
  columns;
  name;
  nullsNotDistinct = !1;
  getName() {
    return this.name;
  }
};
_a11 = entityKind, __publicField(UniqueConstraint, _a11, "PgUniqueConstraint");

// node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    let char = arrayString[i];
    if (char === "\\") {
      i++;
      continue;
    }
    if (char === '"')
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    if (!inQuotes && (char === "," || char === "}"))
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  let result = [], i = startFrom, lastCharIsComma = !1;
  for (; i < arrayString.length; ) {
    let char = arrayString[i];
    if (char === ",") {
      (lastCharIsComma || i === startFrom) && result.push(""), lastCharIsComma = !0, i++;
      continue;
    }
    if (lastCharIsComma = !1, char === "\\") {
      i += 2;
      continue;
    }
    if (char === '"') {
      let [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, !0);
      result.push(value2), i = startFrom2;
      continue;
    }
    if (char === "}")
      return [result, i + 1];
    if (char === "{") {
      let [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2), i = startFrom2;
      continue;
    }
    let [value, newStartFrom] = parsePgArrayValue(arrayString, i, !1);
    result.push(value), i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  let [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => Array.isArray(item) ? makePgArray(item) : typeof item == "string" ? `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : `${item}`).join(",")}}`;
}

// node_modules/drizzle-orm/pg-core/columns/common.js
var _a12, PgColumnBuilder = class extends ColumnBuilder {
  foreignKeyConfigs = [];
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions = {}) {
    return this.foreignKeyConfigs.push({ ref, actions }), this;
  }
  unique(name, config) {
    return this.config.isUnique = !0, this.config.uniqueName = name, this.config.uniqueType = config?.nulls, this;
  }
  generatedAlwaysAs(as) {
    return this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    }, this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => iife(
      (ref2, actions2) => {
        let builder = new ForeignKeyBuilder(() => {
          let foreignColumn = ref2();
          return { columns: [column], foreignColumns: [foreignColumn] };
        });
        return actions2.onUpdate && builder.onUpdate(actions2.onUpdate), actions2.onDelete && builder.onDelete(actions2.onDelete), builder.build(table);
      },
      ref,
      actions
    ));
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
};
_a12 = entityKind, __publicField(PgColumnBuilder, _a12, "PgColumnBuilder");
var _a13, PgColumn = class extends Column {
  constructor(table, config) {
    config.uniqueName || (config.uniqueName = uniqueKeyName(table, [config.name])), super(table, config), this.table = table;
  }
};
_a13 = entityKind, __publicField(PgColumn, _a13, "PgColumn");
var _a14, ExtraConfigColumn = class extends PgColumn {
  getSQLType() {
    return this.getSQLType();
  }
  indexConfig = {
    order: this.config.order ?? "asc",
    nulls: this.config.nulls ?? "last",
    opClass: this.config.opClass
  };
  defaultConfig = {
    order: "asc",
    nulls: "last",
    opClass: void 0
  };
  asc() {
    return this.indexConfig.order = "asc", this;
  }
  desc() {
    return this.indexConfig.order = "desc", this;
  }
  nullsFirst() {
    return this.indexConfig.nulls = "first", this;
  }
  nullsLast() {
    return this.indexConfig.nulls = "last", this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    return this.indexConfig.opClass = opClass, this;
  }
};
_a14 = entityKind, __publicField(ExtraConfigColumn, _a14, "ExtraConfigColumn");
var _a15, IndexedColumn = class {
  constructor(name, keyAsName, type, indexConfig) {
    this.name = name, this.keyAsName = keyAsName, this.type = type, this.indexConfig = indexConfig;
  }
  name;
  keyAsName;
  type;
  indexConfig;
};
_a15 = entityKind, __publicField(IndexedColumn, _a15, "IndexedColumn");
var _a16, PgArrayBuilder = class extends PgColumnBuilder {
  constructor(name, baseBuilder, size) {
    super(name, "array", "PgArray"), this.config.baseBuilder = baseBuilder, this.config.size = size;
  }
  /** @internal */
  build(table) {
    let baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
};
_a16 = entityKind, __publicField(PgArrayBuilder, _a16, "PgArrayBuilder");
var _a17, _PgArray = class extends PgColumn {
  constructor(table, config, baseColumn, range) {
    super(table, config), this.baseColumn = baseColumn, this.range = range, this.size = config.size;
  }
  size;
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size == "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    return typeof value == "string" && (value = parsePgArray(value)), value.map((v) => this.baseColumn.mapFromDriverValue(v));
  }
  mapToDriverValue(value, isNestedArray = !1) {
    let a = value.map(
      (v) => v === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, !0) : this.baseColumn.mapToDriverValue(v)
    );
    return isNestedArray ? a : makePgArray(a);
  }
}, PgArray = _PgArray;
_a17 = entityKind, __publicField(PgArray, _a17, "PgArray");

// node_modules/drizzle-orm/pg-core/columns/enum.js
var _a18, PgEnumObjectColumnBuilder = class extends PgColumnBuilder {
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumObjectColumn"), this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumObjectColumn(
      table,
      this.config
    );
  }
};
_a18 = entityKind, __publicField(PgEnumObjectColumnBuilder, _a18, "PgEnumObjectColumnBuilder");
var _a19, PgEnumObjectColumn = class extends PgColumn {
  enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config), this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};
_a19 = entityKind, __publicField(PgEnumObjectColumn, _a19, "PgEnumObjectColumn");
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj == "function" && isPgEnumSym in obj && obj[isPgEnumSym] === !0;
}
var _a20, PgEnumColumnBuilder = class extends PgColumnBuilder {
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumColumn"), this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumColumn(
      table,
      this.config
    );
  }
};
_a20 = entityKind, __publicField(PgEnumColumnBuilder, _a20, "PgEnumColumnBuilder");
var _a21, PgEnumColumn = class extends PgColumn {
  enum = this.config.enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config), this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};
_a21 = entityKind, __publicField(PgEnumColumn, _a21, "PgEnumColumn");

// node_modules/drizzle-orm/subquery.js
var _a22, Subquery = class {
  constructor(sql11, fields, alias, isWith = !1, usedTables = []) {
    this._ = {
      brand: "Subquery",
      sql: sql11,
      selectedFields: fields,
      alias,
      isWith,
      usedTables
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
};
_a22 = entityKind, __publicField(Subquery, _a22, "Subquery");
var _a23, WithSubquery = class extends Subquery {
};
_a23 = entityKind, __publicField(WithSubquery, _a23, "WithSubquery");

// node_modules/drizzle-orm/version.js
var version = "0.44.2";

// node_modules/drizzle-orm/tracing.js
var otel, rawTracer, tracer = {
  startActiveSpan(name, fn) {
    return otel ? (rawTracer || (rawTracer = otel.trace.getTracer("drizzle-orm", version)), iife(
      (otel2, rawTracer2) => rawTracer2.startActiveSpan(
        name,
        (span) => {
          try {
            return fn(span);
          } catch (e) {
            throw span.setStatus({
              code: otel2.SpanStatusCode.ERROR,
              message: e instanceof Error ? e.message : "Unknown error"
              // eslint-disable-line no-instanceof/no-instanceof
            }), e;
          } finally {
            span.end();
          }
        }
      ),
      otel,
      rawTracer
    )) : fn();
  }
};

// node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

// node_modules/drizzle-orm/sql/sql.js
var _a24, FakePrimitiveParam = class {
};
_a24 = entityKind, __publicField(FakePrimitiveParam, _a24, "FakePrimitiveParam");
function isSQLWrapper(value) {
  return value != null && typeof value.getSQL == "function";
}
function mergeQueries(queries) {
  let result = { sql: "", params: [] };
  for (let query of queries)
    result.sql += query.sql, result.params.push(...query.params), query.typings?.length && (result.typings || (result.typings = []), result.typings.push(...query.typings));
  return result;
}
var _a25, StringChunk = class {
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
};
_a25 = entityKind, __publicField(StringChunk, _a25, "StringChunk");
var _a26, _SQL = class {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
    for (let chunk of queryChunks)
      if (is(chunk, Table)) {
        let schemaName = chunk[Table.Symbol.Schema];
        this.usedTables.push(
          schemaName === void 0 ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]
        );
      }
  }
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = !1;
  /** @internal */
  usedTables = [];
  append(query) {
    return this.queryChunks.push(...query.queryChunks), this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      let query = this.buildQueryFromSourceParams(this.queryChunks, config);
      return span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      }), query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    let config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    }), {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk))
        return { sql: chunk.value.join(""), params: [] };
      if (is(chunk, Name))
        return { sql: escapeName(chunk.value), params: [] };
      if (chunk === void 0)
        return { sql: "", params: [] };
      if (Array.isArray(chunk)) {
        let result = [new StringChunk("(")];
        for (let [i, p] of chunk.entries())
          result.push(p), i < chunk.length - 1 && result.push(new StringChunk(", "));
        return result.push(new StringChunk(")")), this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, _SQL))
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      if (is(chunk, Table)) {
        let schemaName = chunk[Table.Symbol.Schema], tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        let columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes")
          return { sql: escapeName(columnName), params: [] };
        let schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        let schemaName = chunk[ViewBaseConfig].schema, viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder))
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        let mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL))
          return this.buildQueryFromSourceParams([mappedValue], config);
        if (inlineParams)
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        let typings = ["none"];
        return prepareTyping && (typings = [prepareTyping(chunk.encoder)]), { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      return is(chunk, Placeholder) ? { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] } : is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0 ? { sql: escapeName(chunk.fieldAlias), params: [] } : is(chunk, Subquery) ? chunk._.isWith ? { sql: escapeName(chunk._.alias), params: [] } : this.buildQueryFromSourceParams([
        new StringChunk("("),
        chunk._.sql,
        new StringChunk(") "),
        new Name(chunk._.alias)
      ], config) : isPgEnum(chunk) ? chunk.schema ? { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] } : { sql: escapeName(chunk.enumName), params: [] } : isSQLWrapper(chunk) ? chunk.shouldOmitSQLParens?.() ? this.buildQueryFromSourceParams([chunk.getSQL()], config) : this.buildQueryFromSourceParams([
        new StringChunk("("),
        chunk.getSQL(),
        new StringChunk(")")
      ], config) : inlineParams ? { sql: this.mapInlineParam(chunk, config), params: [] } : { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null)
      return "null";
    if (typeof chunk == "number" || typeof chunk == "boolean")
      return chunk.toString();
    if (typeof chunk == "string")
      return escapeString(chunk);
    if (typeof chunk == "object") {
      let mappedValueAsString = chunk.toString();
      return escapeString(mappedValueAsString === "[object Object]" ? JSON.stringify(chunk) : mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    return alias === void 0 ? this : new _SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    return this.decoder = typeof decoder == "function" ? { mapFromDriverValue: decoder } : decoder, this;
  }
  inlineParams() {
    return this.shouldInlineParams = !0, this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
}, SQL = _SQL;
_a26 = entityKind, __publicField(SQL, _a26, "SQL");
var _a27, Name = class {
  constructor(value) {
    this.value = value;
  }
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
_a27 = entityKind, __publicField(Name, _a27, "Name");
function isDriverValueEncoder(value) {
  return typeof value == "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue == "function";
}
var noopDecoder = {
  mapFromDriverValue: (value) => value
}, noopEncoder = {
  mapToDriverValue: (value) => value
}, noopMapper = {
  ...noopDecoder,
  ...noopEncoder
}, _a28, Param = class {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    this.value = value, this.encoder = encoder;
  }
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
_a28 = entityKind, __publicField(Param, _a28, "Param");
function sql4(strings, ...params) {
  let queryChunks = [];
  (params.length > 0 || strings.length > 0 && strings[0] !== "") && queryChunks.push(new StringChunk(strings[0]));
  for (let [paramIndex, param2] of params.entries())
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  return new SQL(queryChunks);
}
((sql22) => {
  function empty() {
    return new SQL([]);
  }
  sql22.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql22.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql22.raw = raw;
  function join(chunks, separator) {
    let result = [];
    for (let [i, chunk] of chunks.entries())
      i > 0 && separator !== void 0 && result.push(separator), result.push(chunk);
    return new SQL(result);
  }
  sql22.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql22.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql22.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql22.param = param2;
})(sql4 || (sql4 = {}));
((SQL2) => {
  class Aliased {
    constructor(sql22, fieldAlias) {
      this.sql = sql22, this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = !1;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var _a29, Placeholder = class {
  constructor(name2) {
    this.name = name2;
  }
  getSQL() {
    return new SQL([this]);
  }
};
_a29 = entityKind, __publicField(Placeholder, _a29, "Placeholder");
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values))
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      return values[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values))
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      return p.encoder.mapToDriverValue(values[p.value.name]);
    }
    return p;
  });
}
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView"), _a30, View = class {
  /** @internal */
  [(_a30 = entityKind, ViewBaseConfig)];
  /** @internal */
  [IsDrizzleView] = !0;
  constructor({ name: name2, schema: schema3, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema: schema3,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: !1
    };
  }
  getSQL() {
    return new SQL([this]);
  }
};
__publicField(View, _a30, "View");
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
  let nullifyMap = {}, result = columns.reduce(
    (result2, { path, field }, columnIndex) => {
      let decoder;
      is(field, Column) ? decoder = field : is(field, SQL) ? decoder = field.decoder : decoder = field.sql.decoder;
      let node = result2;
      for (let [pathChunkIndex, pathChunk] of path.entries())
        if (pathChunkIndex < path.length - 1)
          pathChunk in node || (node[pathChunk] = {}), node = node[pathChunk];
        else {
          let rawValue = row[columnIndex], value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            let objectName = path[0];
            objectName in nullifyMap ? typeof nullifyMap[objectName] == "string" && nullifyMap[objectName] !== getTableName(field.table) && (nullifyMap[objectName] = !1) : nullifyMap[objectName] = value === null ? getTableName(field.table) : !1;
          }
        }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0)
    for (let [objectName, tableName] of Object.entries(nullifyMap))
      typeof tableName == "string" && !joinsNotNullableMap[tableName] && (result[objectName] = null);
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name != "string")
      return result;
    let newPath = pathPrefix ? [...pathPrefix, name] : [name];
    return is(field, Column) || is(field, SQL) || is(field, SQL.Aliased) ? result.push({ path: newPath, field }) : is(field, Table) ? result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath)) : result.push(...orderSelectedFields(field, newPath)), result;
  }, []);
}
function haveSameKeys(left, right) {
  let leftKeys = Object.keys(left), rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length)
    return !1;
  for (let [index, key] of leftKeys.entries())
    if (key !== rightKeys[index])
      return !1;
  return !0;
}
function mapUpdateSet(table, values) {
  let entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => is(value, SQL) || is(value, Column) ? [key, value] : [key, new Param(value, table[Table.Symbol.Columns][key])]);
  if (entries.length === 0)
    throw new Error("No values to set");
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (let extendedClass of extendedClasses)
    for (let name of Object.getOwnPropertyNames(extendedClass.prototype))
      name !== "constructor" && Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}

// node_modules/drizzle-orm/pg-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys"), EnableRLS = Symbol.for("drizzle:EnableRLS"), _a31, PgTable = class extends Table {
  /**@internal */
  [(_a31 = entityKind, InlineForeignKeys)] = [];
  /** @internal */
  [EnableRLS] = !1;
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
  /** @internal */
  [Table.Symbol.ExtraConfigColumns] = {};
};
__publicField(PgTable, _a31, "PgTable"), /** @internal */
__publicField(PgTable, "Symbol", Object.assign({}, Table.Symbol, {
  InlineForeignKeys,
  EnableRLS
}));

// node_modules/drizzle-orm/pg-core/primary-keys.js
var _a32, PrimaryKeyBuilder = class {
  /** @internal */
  columns;
  /** @internal */
  name;
  constructor(columns, name) {
    this.columns = columns, this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
};
_a32 = entityKind, __publicField(PrimaryKeyBuilder, _a32, "PgPrimaryKeyBuilder");
var _a33, PrimaryKey = class {
  constructor(table, columns, name) {
    this.table = table, this.columns = columns, this.name = name;
  }
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
};
_a33 = entityKind, __publicField(PrimaryKey, _a33, "PgPrimaryKey");

// node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  return isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View) ? new Param(value, column) : value;
}
var eq3 = (left, right) => sql4`${left} = ${bindIfParam(right, left)}`, ne = (left, right) => sql4`${left} <> ${bindIfParam(right, left)}`;
function and2(...unfilteredConditions) {
  let conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length !== 0)
    return conditions.length === 1 ? new SQL(conditions) : new SQL([
      new StringChunk("("),
      sql4.join(conditions, new StringChunk(" and ")),
      new StringChunk(")")
    ]);
}
function or(...unfilteredConditions) {
  let conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length !== 0)
    return conditions.length === 1 ? new SQL(conditions) : new SQL([
      new StringChunk("("),
      sql4.join(conditions, new StringChunk(" or ")),
      new StringChunk(")")
    ]);
}
function not(condition) {
  return sql4`not ${condition}`;
}
var gt = (left, right) => sql4`${left} > ${bindIfParam(right, left)}`, gte = (left, right) => sql4`${left} >= ${bindIfParam(right, left)}`, lt = (left, right) => sql4`${left} < ${bindIfParam(right, left)}`, lte = (left, right) => sql4`${left} <= ${bindIfParam(right, left)}`;
function inArray(column, values) {
  return Array.isArray(values) ? values.length === 0 ? sql4`false` : sql4`${column} in ${values.map((v) => bindIfParam(v, column))}` : sql4`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  return Array.isArray(values) ? values.length === 0 ? sql4`true` : sql4`${column} not in ${values.map((v) => bindIfParam(v, column))}` : sql4`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql4`${value} is null`;
}
function isNotNull(value) {
  return sql4`${value} is not null`;
}
function exists(subquery) {
  return sql4`exists ${subquery}`;
}
function notExists(subquery) {
  return sql4`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql4`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql4`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql4`${column} like ${value}`;
}
function notLike(column, value) {
  return sql4`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql4`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql4`${column} not ilike ${value}`;
}

// node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql4`${column} asc`;
}
function desc3(column) {
  return sql4`${column} desc`;
}

// node_modules/drizzle-orm/relations.js
var _a34, Relation = class {
  constructor(sourceTable, referencedTable, relationName) {
    this.sourceTable = sourceTable, this.referencedTable = referencedTable, this.relationName = relationName, this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
  referencedTableName;
  fieldName;
};
_a34 = entityKind, __publicField(Relation, _a34, "Relation");
var _a35, Relations = class {
  constructor(table, config) {
    this.table = table, this.config = config;
  }
};
_a35 = entityKind, __publicField(Relations, _a35, "Relations");
var _a36, _One = class extends Relation {
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config?.relationName), this.config = config, this.isNullable = isNullable;
  }
  withFieldName(fieldName) {
    let relation = new _One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    return relation.fieldName = fieldName, relation;
  }
}, One = _One;
_a36 = entityKind, __publicField(One, _a36, "One");
var _a37, _Many = class extends Relation {
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config?.relationName), this.config = config;
  }
  withFieldName(fieldName) {
    let relation = new _Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    return relation.fieldName = fieldName, relation;
  }
}, Many = _Many;
_a37 = entityKind, __publicField(Many, _a37, "Many");
function getOperators() {
  return {
    and: and2,
    between,
    eq: eq3,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql: sql4
  };
}
function getOrderByOperators() {
  return {
    sql: sql4,
    asc,
    desc: desc3
  };
}
function extractTablesRelationalConfig(schema3, configHelpers) {
  Object.keys(schema3).length === 1 && "default" in schema3 && !is(schema3.default, Table) && (schema3 = schema3.default);
  let tableNamesMap = {}, relationsBuffer = {}, tablesConfig = {};
  for (let [key, value] of Object.entries(schema3))
    if (is(value, Table)) {
      let dbName = getTableUniqueName(value), bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key, tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (let column of Object.values(
        value[Table.Symbol.Columns]
      ))
        column.primary && tablesConfig[key].primaryKey.push(column);
      let extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig)
        for (let configEntry of Object.values(extraConfig))
          is(configEntry, PrimaryKeyBuilder) && tablesConfig[key].primaryKey.push(...configEntry.columns);
    } else if (is(value, Relations)) {
      let dbName = getTableUniqueName(value.table), tableName = tableNamesMap[dbName], relations2 = value.config(
        configHelpers(value.table)
      ), primaryKey;
      for (let [relationName, relation] of Object.entries(relations2))
        if (tableName) {
          let tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation, primaryKey && tableConfig.primaryKey.push(...primaryKey);
        } else
          dbName in relationsBuffer || (relationsBuffer[dbName] = {
            relations: {},
            primaryKey
          }), relationsBuffer[dbName].relations[relationName] = relation;
    }
  return { tables: tablesConfig, tableNamesMap };
}
function createOne(sourceTable) {
  return function(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      config?.fields.reduce((res, f) => res && f.notNull, !0) ?? !1
    );
  };
}
function createMany(sourceTable) {
  return function(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema3, tableNamesMap, relation) {
  if (is(relation, One) && relation.config)
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  let referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName)
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  let referencedTableConfig = schema3[referencedTableTsName];
  if (!referencedTableConfig)
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  let sourceTable = relation.sourceTable, sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName)
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  let reverseRelations = [];
  for (let referencedTableRelation of Object.values(
    referencedTableConfig.relations
  ))
    (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) && reverseRelations.push(referencedTableRelation);
  if (reverseRelations.length > 1)
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config)
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  let result = {};
  for (let [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries())
    if (selectionItem.isJson) {
      let relation = tableConfig.relations[selectionItem.tsKey], rawSubRows = row[selectionItemIndex], subRows = typeof rawSubRows == "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      let value = mapColumnValue(row[selectionItemIndex]), field = selectionItem.field, decoder;
      is(field, Column) ? decoder = field : is(field, SQL) ? decoder = field.decoder : decoder = field.sql.decoder, result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  return result;
}

// node_modules/drizzle-orm/alias.js
var _a38, ColumnAliasProxyHandler = class {
  constructor(table) {
    this.table = table;
  }
  get(columnObj, prop) {
    return prop === "table" ? this.table : columnObj[prop];
  }
};
_a38 = entityKind, __publicField(ColumnAliasProxyHandler, _a38, "ColumnAliasProxyHandler");
var _a39, TableAliasProxyHandler = class {
  constructor(alias, replaceOriginalName) {
    this.alias = alias, this.replaceOriginalName = replaceOriginalName;
  }
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias)
      return !0;
    if (prop === Table.Symbol.Name)
      return this.alias;
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName)
      return this.alias;
    if (prop === ViewBaseConfig)
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: !0
      };
    if (prop === Table.Symbol.Columns) {
      let columns = target[Table.Symbol.Columns];
      if (!columns)
        return columns;
      let proxiedColumns = {};
      return Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      }), proxiedColumns;
    }
    let value = target[prop];
    return is(value, Column) ? new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this))) : value;
  }
};
_a39 = entityKind, __publicField(TableAliasProxyHandler, _a39, "TableAliasProxyHandler");
var _a40, RelationTableAliasProxyHandler = class {
  constructor(alias) {
    this.alias = alias;
  }
  get(target, prop) {
    return prop === "sourceTable" ? aliasedTable(target.sourceTable, this.alias) : target[prop];
  }
};
_a40 = entityKind, __publicField(RelationTableAliasProxyHandler, _a40, "RelationTableAliasProxyHandler");
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, !1));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, !1)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql4.join(query.queryChunks.map((c) => is(c, Column) ? aliasedTableColumn(c, alias) : is(c, SQL) ? mapColumnsInSQLToAlias(c, alias) : is(c, SQL.Aliased) ? mapColumnsInAliasedSQLToAlias(c, alias) : c));
}

// node_modules/drizzle-orm/selection-proxy.js
var _a41, _SelectionProxyHandler = class {
  config;
  constructor(config) {
    this.config = { ...config };
  }
  get(subquery, prop) {
    if (prop === "_")
      return {
        ...subquery._,
        selectedFields: new Proxy(
          subquery._.selectedFields,
          this
        )
      };
    if (prop === ViewBaseConfig)
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    if (typeof prop == "symbol")
      return subquery[prop];
    let value = (is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery)[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField)
        return value.sql;
      let newValue = value.clone();
      return newValue.isSelectionField = !0, newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql")
        return value;
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    return is(value, Column) ? this.config.alias ? new Proxy(
      value,
      new ColumnAliasProxyHandler(
        new Proxy(
          value.table,
          new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? !1)
        )
      )
    ) : value : typeof value != "object" || value === null ? value : new Proxy(value, new _SelectionProxyHandler(this.config));
  }
}, SelectionProxyHandler = _SelectionProxyHandler;
_a41 = entityKind, __publicField(SelectionProxyHandler, _a41, "SelectionProxyHandler");

// node_modules/drizzle-orm/query-promise.js
var _a42, QueryPromise = class {
  [(_a42 = entityKind, Symbol.toStringTag)] = "QueryPromise";
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => (onFinally?.(), value),
      (reason) => {
        throw onFinally?.(), reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
};
__publicField(QueryPromise, _a42, "QueryPromise");

// node_modules/drizzle-orm/sqlite-core/foreign-keys.js
var _a43, ForeignKeyBuilder2 = class {
  /** @internal */
  reference;
  /** @internal */
  _onUpdate;
  /** @internal */
  _onDelete;
  constructor(config, actions) {
    this.reference = () => {
      let { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    }, actions && (this._onUpdate = actions.onUpdate, this._onDelete = actions.onDelete);
  }
  onUpdate(action26) {
    return this._onUpdate = action26, this;
  }
  onDelete(action26) {
    return this._onDelete = action26, this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey2(table, this);
  }
};
_a43 = entityKind, __publicField(ForeignKeyBuilder2, _a43, "SQLiteForeignKeyBuilder");
var _a44, ForeignKey2 = class {
  constructor(table, builder) {
    this.table = table, this.reference = builder.reference, this.onUpdate = builder._onUpdate, this.onDelete = builder._onDelete;
  }
  reference;
  onUpdate;
  onDelete;
  getName() {
    let { name, columns, foreignColumns } = this.reference(), columnNames = columns.map((column) => column.name), foreignColumnNames = foreignColumns.map((column) => column.name), chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};
_a44 = entityKind, __publicField(ForeignKey2, _a44, "SQLiteForeignKey");

// node_modules/drizzle-orm/sqlite-core/unique-constraint.js
function uniqueKeyName2(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var _a45, UniqueConstraintBuilder2 = class {
  constructor(columns, name) {
    this.name = name, this.columns = columns;
  }
  /** @internal */
  columns;
  /** @internal */
  build(table) {
    return new UniqueConstraint2(table, this.columns, this.name);
  }
};
_a45 = entityKind, __publicField(UniqueConstraintBuilder2, _a45, "SQLiteUniqueConstraintBuilder");
var _a46, UniqueOnConstraintBuilder2 = class {
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder2(columns, this.name);
  }
};
_a46 = entityKind, __publicField(UniqueOnConstraintBuilder2, _a46, "SQLiteUniqueOnConstraintBuilder");
var _a47, UniqueConstraint2 = class {
  constructor(table, columns, name) {
    this.table = table, this.columns = columns, this.name = name ?? uniqueKeyName2(this.table, this.columns.map((column) => column.name));
  }
  columns;
  name;
  getName() {
    return this.name;
  }
};
_a47 = entityKind, __publicField(UniqueConstraint2, _a47, "SQLiteUniqueConstraint");

// node_modules/drizzle-orm/sqlite-core/columns/common.js
var _a48, SQLiteColumnBuilder = class extends ColumnBuilder {
  foreignKeyConfigs = [];
  references(ref, actions = {}) {
    return this.foreignKeyConfigs.push({ ref, actions }), this;
  }
  unique(name) {
    return this.config.isUnique = !0, this.config.uniqueName = name, this;
  }
  generatedAlwaysAs(as, config) {
    return this.config.generated = {
      as,
      type: "always",
      mode: config?.mode ?? "virtual"
    }, this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => ((ref2, actions2) => {
      let builder = new ForeignKeyBuilder2(() => {
        let foreignColumn = ref2();
        return { columns: [column], foreignColumns: [foreignColumn] };
      });
      return actions2.onUpdate && builder.onUpdate(actions2.onUpdate), actions2.onDelete && builder.onDelete(actions2.onDelete), builder.build(table);
    })(ref, actions));
  }
};
_a48 = entityKind, __publicField(SQLiteColumnBuilder, _a48, "SQLiteColumnBuilder");
var _a49, SQLiteColumn = class extends Column {
  constructor(table, config) {
    config.uniqueName || (config.uniqueName = uniqueKeyName2(table, [config.name])), super(table, config), this.table = table;
  }
};
_a49 = entityKind, __publicField(SQLiteColumn, _a49, "SQLiteColumn");

// node_modules/drizzle-orm/sqlite-core/table.js
var InlineForeignKeys2 = Symbol.for("drizzle:SQLiteInlineForeignKeys"), _a50, SQLiteTable = class extends Table {
  /** @internal */
  [(_a50 = entityKind, Table.Symbol.Columns)];
  /** @internal */
  [InlineForeignKeys2] = [];
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
};
__publicField(SQLiteTable, _a50, "SQLiteTable"), /** @internal */
__publicField(SQLiteTable, "Symbol", Object.assign({}, Table.Symbol, {
  InlineForeignKeys: InlineForeignKeys2
}));

// node_modules/drizzle-orm/sqlite-core/utils.js
function extractUsedTable(table) {
  return is(table, SQLiteTable) ? [`${table[Table.Symbol.BaseName]}`] : is(table, Subquery) ? table._.usedTables ?? [] : is(table, SQL) ? table.usedTables ?? [] : [];
}

// node_modules/drizzle-orm/sqlite-core/query-builders/delete.js
var _a51, SQLiteDeleteBase = class extends QueryPromise {
  constructor(table, session, dialect, withList) {
    super(), this.table = table, this.session = session, this.dialect = dialect, this.config = { table, withList };
  }
  /** @internal */
  config;
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    return this.config.where = where, this;
  }
  orderBy(...columns) {
    if (typeof columns[0] == "function") {
      let orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      ), orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      let orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    return this.config.limit = limit, this;
  }
  returning(fields = this.table[SQLiteTable.Symbol.Columns]) {
    return this.config.returning = orderSelectedFields(fields), this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    let { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = !0) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run",
      !0,
      void 0,
      {
        type: "delete",
        tables: extractUsedTable(this.config.table)
      }
    );
  }
  prepare() {
    return this._prepare(!1);
  }
  run = (placeholderValues) => this._prepare().run(placeholderValues);
  all = (placeholderValues) => this._prepare().all(placeholderValues);
  get = (placeholderValues) => this._prepare().get(placeholderValues);
  values = (placeholderValues) => this._prepare().values(placeholderValues);
  async execute(placeholderValues) {
    return this._prepare().execute(placeholderValues);
  }
  $dynamic() {
    return this;
  }
};
_a51 = entityKind, __publicField(SQLiteDeleteBase, _a51, "SQLiteDelete");

// node_modules/drizzle-orm/casing.js
function toSnakeCase(input) {
  return (input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? []).map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  return (input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? []).reduce((acc, word, i) => {
    let formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
var _a52, CasingCache = class {
  /** @internal */
  cache = {};
  cachedTables = {};
  convert;
  constructor(casing) {
    this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
  }
  getColumnCasing(column) {
    if (!column.keyAsName)
      return column.name;
    let schema3 = column.table[Table.Symbol.Schema] ?? "public", tableName = column.table[Table.Symbol.OriginalName], key = `${schema3}.${tableName}.${column.name}`;
    return this.cache[key] || this.cacheTable(column.table), this.cache[key];
  }
  cacheTable(table) {
    let schema3 = table[Table.Symbol.Schema] ?? "public", tableName = table[Table.Symbol.OriginalName], tableKey = `${schema3}.${tableName}`;
    if (!this.cachedTables[tableKey]) {
      for (let column of Object.values(table[Table.Symbol.Columns])) {
        let columnKey = `${tableKey}.${column.name}`;
        this.cache[columnKey] = this.convert(column.name);
      }
      this.cachedTables[tableKey] = !0;
    }
  }
  clearCache() {
    this.cache = {}, this.cachedTables = {};
  }
};
_a52 = entityKind, __publicField(CasingCache, _a52, "CasingCache");

// node_modules/drizzle-orm/errors.js
var _a53, DrizzleError = class extends Error {
  constructor({ message, cause }) {
    super(message), this.name = "DrizzleError", this.cause = cause;
  }
};
_a53 = entityKind, __publicField(DrizzleError, _a53, "DrizzleError");
var _a54, TransactionRollbackError = class extends DrizzleError {
  constructor() {
    super({ message: "Rollback" });
  }
};
_a54 = entityKind, __publicField(TransactionRollbackError, _a54, "TransactionRollbackError");

// node_modules/drizzle-orm/sqlite-core/view-base.js
var _a55, SQLiteViewBase = class extends View {
};
_a55 = entityKind, __publicField(SQLiteViewBase, _a55, "SQLiteViewBase");

// node_modules/drizzle-orm/sqlite-core/dialect.js
var _a56, SQLiteDialect = class {
  /** @internal */
  casing;
  constructor(config) {
    this.casing = new CasingCache(config?.casing);
  }
  escapeName(name) {
    return `"${name}"`;
  }
  escapeParam(_num) {
    return "?";
  }
  escapeString(str) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!queries?.length)
      return;
    let withSqlChunks = [sql4`with `];
    for (let [i, w] of queries.entries())
      withSqlChunks.push(sql4`${sql4.identifier(w._.alias)} as (${w._.sql})`), i < queries.length - 1 && withSqlChunks.push(sql4`, `);
    return withSqlChunks.push(sql4` `), sql4.join(withSqlChunks);
  }
  buildDeleteQuery({ table, where, returning, withList, limit, orderBy }) {
    let withSql = this.buildWithCTE(withList), returningSql = returning ? sql4` returning ${this.buildSelection(returning, { isSingleTable: !0 })}` : void 0, whereSql = where ? sql4` where ${where}` : void 0, orderBySql = this.buildOrderBy(orderBy), limitSql = this.buildLimit(limit);
    return sql4`${withSql}delete from ${table}${whereSql}${returningSql}${orderBySql}${limitSql}`;
  }
  buildUpdateSet(table, set) {
    let tableColumns = table[Table.Symbol.Columns], columnNames = Object.keys(tableColumns).filter(
      (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
    ), setSize = columnNames.length;
    return sql4.join(columnNames.flatMap((colName, i) => {
      let col = tableColumns[colName], value = set[colName] ?? sql4.param(col.onUpdateFn(), col), res = sql4`${sql4.identifier(this.casing.getColumnCasing(col))} = ${value}`;
      return i < setSize - 1 ? [res, sql4.raw(", ")] : [res];
    }));
  }
  buildUpdateQuery({ table, set, where, returning, withList, joins, from, limit, orderBy }) {
    let withSql = this.buildWithCTE(withList), setSql = this.buildUpdateSet(table, set), fromSql = from && sql4.join([sql4.raw(" from "), this.buildFromTable(from)]), joinsSql = this.buildJoins(joins), returningSql = returning ? sql4` returning ${this.buildSelection(returning, { isSingleTable: !0 })}` : void 0, whereSql = where ? sql4` where ${where}` : void 0, orderBySql = this.buildOrderBy(orderBy), limitSql = this.buildLimit(limit);
    return sql4`${withSql}update ${table} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}${orderBySql}${limitSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = !1 } = {}) {
    let columnsLen = fields.length, chunks = fields.flatMap(({ field }, i) => {
      let chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField)
        chunk.push(sql4.identifier(field.fieldAlias));
      else if (is(field, SQL.Aliased) || is(field, SQL)) {
        let query = is(field, SQL.Aliased) ? field.sql : field;
        isSingleTable ? chunk.push(
          new SQL(
            query.queryChunks.map((c) => is(c, Column) ? sql4.identifier(this.casing.getColumnCasing(c)) : c)
          )
        ) : chunk.push(query), is(field, SQL.Aliased) && chunk.push(sql4` as ${sql4.identifier(field.fieldAlias)}`);
      } else if (is(field, Column)) {
        let tableName = field.table[Table.Symbol.Name];
        field.columnType === "SQLiteNumericBigInt" ? isSingleTable ? chunk.push(sql4`cast(${sql4.identifier(this.casing.getColumnCasing(field))} as text)`) : chunk.push(
          sql4`cast(${sql4.identifier(tableName)}.${sql4.identifier(this.casing.getColumnCasing(field))} as text)`
        ) : isSingleTable ? chunk.push(sql4.identifier(this.casing.getColumnCasing(field))) : chunk.push(sql4`${sql4.identifier(tableName)}.${sql4.identifier(this.casing.getColumnCasing(field))}`);
      }
      return i < columnsLen - 1 && chunk.push(sql4`, `), chunk;
    });
    return sql4.join(chunks);
  }
  buildJoins(joins) {
    if (!joins || joins.length === 0)
      return;
    let joinsArray = [];
    if (joins)
      for (let [index, joinMeta] of joins.entries()) {
        index === 0 && joinsArray.push(sql4` `);
        let table = joinMeta.table, onSql = joinMeta.on ? sql4` on ${joinMeta.on}` : void 0;
        if (is(table, SQLiteTable)) {
          let tableName = table[SQLiteTable.Symbol.Name], tableSchema = table[SQLiteTable.Symbol.Schema], origTableName = table[SQLiteTable.Symbol.OriginalName], alias = tableName === origTableName ? void 0 : joinMeta.alias;
          joinsArray.push(
            sql4`${sql4.raw(joinMeta.joinType)} join ${tableSchema ? sql4`${sql4.identifier(tableSchema)}.` : void 0}${sql4.identifier(origTableName)}${alias && sql4` ${sql4.identifier(alias)}`}${onSql}`
          );
        } else
          joinsArray.push(
            sql4`${sql4.raw(joinMeta.joinType)} join ${table}${onSql}`
          );
        index < joins.length - 1 && joinsArray.push(sql4` `);
      }
    return sql4.join(joinsArray);
  }
  buildLimit(limit) {
    return typeof limit == "object" || typeof limit == "number" && limit >= 0 ? sql4` limit ${limit}` : void 0;
  }
  buildOrderBy(orderBy) {
    let orderByList = [];
    if (orderBy)
      for (let [index, orderByValue] of orderBy.entries())
        orderByList.push(orderByValue), index < orderBy.length - 1 && orderByList.push(sql4`, `);
    return orderByList.length > 0 ? sql4` order by ${sql4.join(orderByList)}` : void 0;
  }
  buildFromTable(table) {
    return is(table, Table) && table[Table.Symbol.IsAlias] ? sql4`${sql4`${sql4.identifier(table[Table.Symbol.Schema] ?? "")}.`.if(table[Table.Symbol.Schema])}${sql4.identifier(table[Table.Symbol.OriginalName])} ${sql4.identifier(table[Table.Symbol.Name])}` : table;
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit,
    offset,
    distinct,
    setOperators
  }) {
    let fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (let f of fieldsList)
      if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, SQLiteViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f.field.table)) {
        let tableName = getTableName(f.field.table);
        throw new Error(
          `Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    let isSingleTable = !joins || joins.length === 0, withSql = this.buildWithCTE(withList), distinctSql = distinct ? sql4` distinct` : void 0, selection = this.buildSelection(fieldsList, { isSingleTable }), tableSql = this.buildFromTable(table), joinsSql = this.buildJoins(joins), whereSql = where ? sql4` where ${where}` : void 0, havingSql = having ? sql4` having ${having}` : void 0, groupByList = [];
    if (groupBy)
      for (let [index, groupByValue] of groupBy.entries())
        groupByList.push(groupByValue), index < groupBy.length - 1 && groupByList.push(sql4`, `);
    let groupBySql = groupByList.length > 0 ? sql4` group by ${sql4.join(groupByList)}` : void 0, orderBySql = this.buildOrderBy(orderBy), limitSql = this.buildLimit(limit), offsetSql = offset ? sql4` offset ${offset}` : void 0, finalQuery = sql4`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}`;
    return setOperators.length > 0 ? this.buildSetOperations(finalQuery, setOperators) : finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    let [setOperator, ...rest] = setOperators;
    if (!setOperator)
      throw new Error("Cannot pass undefined values to any set operator");
    return rest.length === 0 ? this.buildSetOperationQuery({ leftSelect, setOperator }) : this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
  }) {
    let leftChunk = sql4`${leftSelect.getSQL()} `, rightChunk = sql4`${rightSelect.getSQL()}`, orderBySql;
    if (orderBy && orderBy.length > 0) {
      let orderByValues = [];
      for (let singleOrderBy of orderBy)
        if (is(singleOrderBy, SQLiteColumn))
          orderByValues.push(sql4.identifier(singleOrderBy.name));
        else if (is(singleOrderBy, SQL)) {
          for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
            let chunk = singleOrderBy.queryChunks[i];
            is(chunk, SQLiteColumn) && (singleOrderBy.queryChunks[i] = sql4.identifier(this.casing.getColumnCasing(chunk)));
          }
          orderByValues.push(sql4`${singleOrderBy}`);
        } else
          orderByValues.push(sql4`${singleOrderBy}`);
      orderBySql = sql4` order by ${sql4.join(orderByValues, sql4`, `)}`;
    }
    let limitSql = typeof limit == "object" || typeof limit == "number" && limit >= 0 ? sql4` limit ${limit}` : void 0, operatorChunk = sql4.raw(`${type} ${isAll ? "all " : ""}`), offsetSql = offset ? sql4` offset ${offset}` : void 0;
    return sql4`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select }) {
    let valuesSqlList = [], columns = table[Table.Symbol.Columns], colEntries = Object.entries(columns).filter(
      ([_, col]) => !col.shouldDisableInsert()
    ), insertOrder = colEntries.map(([, column]) => sql4.identifier(this.casing.getColumnCasing(column)));
    if (select) {
      let select2 = valuesOrSelect;
      is(select2, SQL) ? valuesSqlList.push(select2) : valuesSqlList.push(select2.getSQL());
    } else {
      let values = valuesOrSelect;
      valuesSqlList.push(sql4.raw("values "));
      for (let [valueIndex, value] of values.entries()) {
        let valueList = [];
        for (let [fieldName, col] of colEntries) {
          let colValue = value[fieldName];
          if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
            let defaultValue;
            if (col.default !== null && col.default !== void 0)
              defaultValue = is(col.default, SQL) ? col.default : sql4.param(col.default, col);
            else if (col.defaultFn !== void 0) {
              let defaultFnResult = col.defaultFn();
              defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql4.param(defaultFnResult, col);
            } else if (!col.default && col.onUpdateFn !== void 0) {
              let onUpdateFnResult = col.onUpdateFn();
              defaultValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql4.param(onUpdateFnResult, col);
            } else
              defaultValue = sql4`null`;
            valueList.push(defaultValue);
          } else
            valueList.push(colValue);
        }
        valuesSqlList.push(valueList), valueIndex < values.length - 1 && valuesSqlList.push(sql4`, `);
      }
    }
    let withSql = this.buildWithCTE(withList), valuesSql = sql4.join(valuesSqlList), returningSql = returning ? sql4` returning ${this.buildSelection(returning, { isSingleTable: !0 })}` : void 0, onConflictSql = onConflict?.length ? sql4.join(onConflict) : void 0;
    return sql4`${withSql}insert into ${table} ${insertOrder} ${valuesSql}${onConflictSql}${returningSql}`;
  }
  sqlToQuery(sql22, invokeSource) {
    return sql22.toQuery({
      casing: this.casing,
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString,
      invokeSource
    });
  }
  buildRelationalQuery({
    fullSchema,
    schema: schema3,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [], limit, offset, orderBy = [], where, joins = [];
    if (config === !0)
      selection = Object.entries(tableConfig.columns).map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: !1,
        selection: []
      }));
    else {
      let aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config.where) {
        let whereSql = typeof config.where == "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      let fieldsSelection = [], selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = !1;
        for (let [field, value] of Object.entries(config.columns))
          value !== void 0 && field in tableConfig.columns && (!isIncludeMode && value === !0 && (isIncludeMode = !0), selectedColumns.push(field));
        selectedColumns.length > 0 && (selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === !0) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key)));
      } else
        selectedColumns = Object.keys(tableConfig.columns);
      for (let field of selectedColumns) {
        let column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      config.with && (selectedRelations = Object.entries(config.with).filter((entry2) => !!entry2[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] })));
      let extras;
      if (config.extras) {
        extras = typeof config.extras == "function" ? config.extras(aliasedColumns, { sql: sql4 }) : config.extras;
        for (let [tsKey, value] of Object.entries(extras))
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
      }
      for (let { tsKey, value } of fieldsSelection)
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: !1,
          selection: []
        });
      let orderByOrig = typeof config.orderBy == "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      Array.isArray(orderByOrig) || (orderByOrig = [orderByOrig]), orderBy = orderByOrig.map((orderByValue) => is(orderByValue, Column) ? aliasedTableColumn(orderByValue, tableAlias) : mapColumnsInSQLToAlias(orderByValue, tableAlias)), limit = config.limit, offset = config.offset;
      for (let {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        let normalizedRelation = normalizeRelation(schema3, tableNamesMap, relation), relationTableName = getTableUniqueName(relation.referencedTable), relationTableTsName = tableNamesMap[relationTableName], relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`, joinOn2 = and2(
          ...normalizedRelation.fields.map(
            (field2, i) => eq3(
              aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        ), builtRelation = this.buildRelationalQuery({
          fullSchema,
          schema: schema3,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema3[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === !0 ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        }), field = sql4`(${builtRelation.sql})`.as(selectedRelationTsKey);
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: !0,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0)
      throw new DrizzleError({
        message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.`
      });
    let result;
    if (where = and2(joinOn, where), nestedQueryRelation) {
      let field = sql4`json_array(${sql4.join(
        selection.map(
          ({ field: field2 }) => is(field2, SQLiteColumn) ? sql4.identifier(this.casing.getColumnCasing(field2)) : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql4`, `
      )})`;
      is(nestedQueryRelation, Many) && (field = sql4`coalesce(json_group_array(${field}), json_array())`);
      let nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field: field.as("data"),
        isJson: !0,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      limit !== void 0 || offset !== void 0 || orderBy.length > 0 ? (result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: [
          {
            path: [],
            field: sql4.raw("*")
          }
        ],
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      }), where = void 0, limit = void 0, offset = void 0, orderBy = void 0) : result = aliasedTable(table, tableAlias), result = this.buildSelectQuery({
        table: is(result, SQLiteTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
};
_a56 = entityKind, __publicField(SQLiteDialect, _a56, "SQLiteDialect");
var _a57, SQLiteSyncDialect = class extends SQLiteDialect {
  migrate(migrations, session, config) {
    let migrationsTable = config === void 0 || typeof config == "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations", migrationTableCreate = sql4`
			CREATE TABLE IF NOT EXISTS ${sql4.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
    session.run(migrationTableCreate);
    let lastDbMigration = session.values(
      sql4`SELECT id, hash, created_at FROM ${sql4.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`
    )[0] ?? void 0;
    session.run(sql4`BEGIN`);
    try {
      for (let migration of migrations)
        if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
          for (let stmt of migration.sql)
            session.run(sql4.raw(stmt));
          session.run(
            sql4`INSERT INTO ${sql4.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
          );
        }
      session.run(sql4`COMMIT`);
    } catch (e) {
      throw session.run(sql4`ROLLBACK`), e;
    }
  }
};
_a57 = entityKind, __publicField(SQLiteSyncDialect, _a57, "SQLiteSyncDialect");
var _a58, SQLiteAsyncDialect = class extends SQLiteDialect {
  async migrate(migrations, session, config) {
    let migrationsTable = config === void 0 || typeof config == "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations", migrationTableCreate = sql4`
			CREATE TABLE IF NOT EXISTS ${sql4.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
    await session.run(migrationTableCreate);
    let lastDbMigration = (await session.values(
      sql4`SELECT id, hash, created_at FROM ${sql4.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`
    ))[0] ?? void 0;
    await session.transaction(async (tx) => {
      for (let migration of migrations)
        if (!lastDbMigration || Number(lastDbMigration[2]) < migration.folderMillis) {
          for (let stmt of migration.sql)
            await tx.run(sql4.raw(stmt));
          await tx.run(
            sql4`INSERT INTO ${sql4.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
          );
        }
    });
  }
};
_a58 = entityKind, __publicField(SQLiteAsyncDialect, _a58, "SQLiteAsyncDialect");

// node_modules/drizzle-orm/query-builders/query-builder.js
var _a59, TypedQueryBuilder = class {
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
};
_a59 = entityKind, __publicField(TypedQueryBuilder, _a59, "TypedQueryBuilder");

// node_modules/drizzle-orm/sqlite-core/query-builders/select.js
var _a60, SQLiteSelectBuilder = class {
  fields;
  session;
  dialect;
  withList;
  distinct;
  constructor(config) {
    this.fields = config.fields, this.session = config.session, this.dialect = config.dialect, this.withList = config.withList, this.distinct = config.distinct;
  }
  from(source) {
    let isPartialSelect = !!this.fields, fields;
    return this.fields ? fields = this.fields : is(source, Subquery) ? fields = Object.fromEntries(
      Object.keys(source._.selectedFields).map((key) => [key, source[key]])
    ) : is(source, SQLiteViewBase) ? fields = source[ViewBaseConfig].selectedFields : is(source, SQL) ? fields = {} : fields = getTableColumns(source), new SQLiteSelectBase({
      table: source,
      fields,
      isPartialSelect,
      session: this.session,
      dialect: this.dialect,
      withList: this.withList,
      distinct: this.distinct
    });
  }
};
_a60 = entityKind, __publicField(SQLiteSelectBuilder, _a60, "SQLiteSelectBuilder");
var _a61, SQLiteSelectQueryBuilderBase = class extends TypedQueryBuilder {
  _;
  /** @internal */
  config;
  joinsNotNullableMap;
  tableName;
  isPartialSelect;
  session;
  dialect;
  cacheConfig = void 0;
  usedTables = /* @__PURE__ */ new Set();
  constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
    super(), this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: []
    }, this.isPartialSelect = isPartialSelect, this.session = session, this.dialect = dialect, this._ = {
      selectedFields: fields,
      config: this.config
    }, this.tableName = getTableLikeName(table), this.joinsNotNullableMap = typeof this.tableName == "string" ? { [this.tableName]: !0 } : {};
    for (let item of extractUsedTable(table))
      this.usedTables.add(item);
  }
  /** @internal */
  getUsedTables() {
    return [...this.usedTables];
  }
  createJoin(joinType) {
    return (table, on) => {
      let baseTableName = this.tableName, tableName = getTableLikeName(table);
      for (let item of extractUsedTable(table))
        this.usedTables.add(item);
      if (typeof tableName == "string" && this.config.joins?.some((join) => join.alias === tableName))
        throw new Error(`Alias "${tableName}" is already used in this query`);
      if (!this.isPartialSelect && (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName == "string" && (this.config.fields = {
        [baseTableName]: this.config.fields
      }), typeof tableName == "string" && !is(table, SQL))) {
        let selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
        this.config.fields[tableName] = selection;
      }
      if (typeof on == "function" && (on = on(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      )), this.config.joins || (this.config.joins = []), this.config.joins.push({ on, table, joinType, alias: tableName }), typeof tableName == "string")
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = !1;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, !1])
            ), this.joinsNotNullableMap[tableName] = !0;
            break;
          }
          case "cross":
          case "inner": {
            this.joinsNotNullableMap[tableName] = !0;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, !1])
            ), this.joinsNotNullableMap[tableName] = !1;
            break;
          }
        }
      return this;
    };
  }
  /**
   * Executes a `left join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  leftJoin = this.createJoin("left");
  /**
   * Executes a `right join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  rightJoin = this.createJoin("right");
  /**
   * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  innerJoin = this.createJoin("inner");
  /**
   * Executes a `full join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet | null; }[] = await db.select()
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  fullJoin = this.createJoin("full");
  /**
   * Executes a `cross join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
   *
   * @param table the table to join.
   *
   * @example
   *
   * ```ts
   * // Select all users, each user with every pet
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .crossJoin(pets)
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .crossJoin(pets)
   * ```
   */
  crossJoin = this.createJoin("cross");
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      let rightSelect = typeof rightSelection == "function" ? rightSelection(getSQLiteSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields()))
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      return this.config.setOperators.push({ type, isAll, rightSelect }), this;
    };
  }
  /**
   * Adds `union` set operator to the query.
   *
   * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
   *
   * @example
   *
   * ```ts
   * // Select all unique names from customers and users tables
   * await db.select({ name: users.name })
   *   .from(users)
   *   .union(
   *     db.select({ name: customers.name }).from(customers)
   *   );
   * // or
   * import { union } from 'drizzle-orm/sqlite-core'
   *
   * await union(
   *   db.select({ name: users.name }).from(users),
   *   db.select({ name: customers.name }).from(customers)
   * );
   * ```
   */
  union = this.createSetOperator("union", !1);
  /**
   * Adds `union all` set operator to the query.
   *
   * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
   *
   * @example
   *
   * ```ts
   * // Select all transaction ids from both online and in-store sales
   * await db.select({ transaction: onlineSales.transactionId })
   *   .from(onlineSales)
   *   .unionAll(
   *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   *   );
   * // or
   * import { unionAll } from 'drizzle-orm/sqlite-core'
   *
   * await unionAll(
   *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
   *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   * );
   * ```
   */
  unionAll = this.createSetOperator("union", !0);
  /**
   * Adds `intersect` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
   *
   * @example
   *
   * ```ts
   * // Select course names that are offered in both departments A and B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .intersect(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { intersect } from 'drizzle-orm/sqlite-core'
   *
   * await intersect(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  intersect = this.createSetOperator("intersect", !1);
  /**
   * Adds `except` set operator to the query.
   *
   * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
   *
   * @example
   *
   * ```ts
   * // Select all courses offered in department A but not in department B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .except(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { except } from 'drizzle-orm/sqlite-core'
   *
   * await except(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  except = this.createSetOperator("except", !1);
  /** @internal */
  addSetOperators(setOperators) {
    return this.config.setOperators.push(...setOperators), this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    return typeof where == "function" && (where = where(
      new Proxy(
        this.config.fields,
        new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
      )
    )), this.config.where = where, this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    return typeof having == "function" && (having = having(
      new Proxy(
        this.config.fields,
        new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
      )
    )), this.config.having = having, this;
  }
  groupBy(...columns) {
    if (typeof columns[0] == "function") {
      let groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else
      this.config.groupBy = columns;
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] == "function") {
      let orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      ), orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = orderByArray : this.config.orderBy = orderByArray;
    } else {
      let orderByArray = columns;
      this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = orderByArray : this.config.orderBy = orderByArray;
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit) {
    return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).limit = limit : this.config.limit = limit, this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).offset = offset : this.config.offset = offset, this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    let { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    let usedTables = [];
    if (usedTables.push(...extractUsedTable(this.config.table)), this.config.joins)
      for (let it of this.config.joins)
        usedTables.push(...extractUsedTable(it.table));
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias, !1, [...new Set(usedTables)]),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
};
_a61 = entityKind, __publicField(SQLiteSelectQueryBuilderBase, _a61, "SQLiteSelectQueryBuilder");
var _a62, SQLiteSelectBase = class extends SQLiteSelectQueryBuilderBase {
  /** @internal */
  _prepare(isOneTimeQuery = !0) {
    if (!this.session)
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    let fieldsList = orderSelectedFields(this.config.fields), query = this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      fieldsList,
      "all",
      !0,
      void 0,
      {
        type: "select",
        tables: [...this.usedTables]
      },
      this.cacheConfig
    );
    return query.joinsNotNullableMap = this.joinsNotNullableMap, query;
  }
  $withCache(config) {
    return this.cacheConfig = config === void 0 ? { config: {}, enable: !0, autoInvalidate: !0 } : config === !1 ? { enable: !1 } : { enable: !0, autoInvalidate: !0, ...config }, this;
  }
  prepare() {
    return this._prepare(!1);
  }
  run = (placeholderValues) => this._prepare().run(placeholderValues);
  all = (placeholderValues) => this._prepare().all(placeholderValues);
  get = (placeholderValues) => this._prepare().get(placeholderValues);
  values = (placeholderValues) => this._prepare().values(placeholderValues);
  async execute() {
    return this.all();
  }
};
_a62 = entityKind, __publicField(SQLiteSelectBase, _a62, "SQLiteSelect");
applyMixins(SQLiteSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    let setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (let setOperator of setOperators)
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields()))
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
    return leftSelect.addSetOperators(setOperators);
  };
}
var getSQLiteSetOperators = () => ({
  union,
  unionAll,
  intersect,
  except
}), union = createSetOperator("union", !1), unionAll = createSetOperator("union", !0), intersect = createSetOperator("intersect", !1), except = createSetOperator("except", !1);

// node_modules/drizzle-orm/sqlite-core/query-builders/query-builder.js
var _a63, QueryBuilder = class {
  dialect;
  dialectConfig;
  constructor(dialect) {
    this.dialect = is(dialect, SQLiteDialect) ? dialect : void 0, this.dialectConfig = is(dialect, SQLiteDialect) ? void 0 : dialect;
  }
  $with = (alias, selection) => {
    let queryBuilder = this;
    return { as: (qb) => (typeof qb == "function" && (qb = qb(queryBuilder)), new Proxy(
      new WithSubquery(
        qb.getSQL(),
        selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
        alias,
        !0
      ),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    )) };
  };
  with(...queries) {
    let self2 = this;
    function select(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self2.getDialect(),
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self2.getDialect(),
        withList: queries,
        distinct: !0
      });
    }
    return { select, selectDistinct };
  }
  select(fields) {
    return new SQLiteSelectBuilder({ fields: fields ?? void 0, session: void 0, dialect: this.getDialect() });
  }
  selectDistinct(fields) {
    return new SQLiteSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: !0
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    return this.dialect || (this.dialect = new SQLiteSyncDialect(this.dialectConfig)), this.dialect;
  }
};
_a63 = entityKind, __publicField(QueryBuilder, _a63, "SQLiteQueryBuilder");

// node_modules/drizzle-orm/sqlite-core/query-builders/insert.js
var _a64, SQLiteInsertBuilder = class {
  constructor(table, session, dialect, withList) {
    this.table = table, this.session = session, this.dialect = dialect, this.withList = withList;
  }
  values(values) {
    if (values = Array.isArray(values) ? values : [values], values.length === 0)
      throw new Error("values() must be called with at least one value");
    let mappedValues = values.map((entry2) => {
      let result = {}, cols = this.table[Table.Symbol.Columns];
      for (let colKey of Object.keys(entry2)) {
        let colValue = entry2[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new SQLiteInsertBase(this.table, mappedValues, this.session, this.dialect, this.withList);
  }
  select(selectQuery) {
    let select = typeof selectQuery == "function" ? selectQuery(new QueryBuilder()) : selectQuery;
    if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields))
      throw new Error(
        "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
      );
    return new SQLiteInsertBase(this.table, select, this.session, this.dialect, this.withList, !0);
  }
};
_a64 = entityKind, __publicField(SQLiteInsertBuilder, _a64, "SQLiteInsertBuilder");
var _a65, SQLiteInsertBase = class extends QueryPromise {
  constructor(table, values, session, dialect, withList, select) {
    super(), this.session = session, this.dialect = dialect, this.config = { table, values, withList, select };
  }
  /** @internal */
  config;
  returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
    return this.config.returning = orderSelectedFields(fields), this;
  }
  /**
   * Adds an `on conflict do nothing` clause to the query.
   *
   * Calling this method simply avoids inserting a row as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
   *
   * @param config The `target` and `where` clauses.
   *
   * @example
   * ```ts
   * // Insert one row and cancel the insert if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing();
   *
   * // Explicitly specify conflict target
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing({ target: cars.id });
   * ```
   */
  onConflictDoNothing(config = {}) {
    if (this.config.onConflict || (this.config.onConflict = []), config.target === void 0)
      this.config.onConflict.push(sql4` on conflict do nothing`);
    else {
      let targetSql = Array.isArray(config.target) ? sql4`${config.target}` : sql4`${[config.target]}`, whereSql = config.where ? sql4` where ${config.where}` : sql4``;
      this.config.onConflict.push(sql4` on conflict ${targetSql} do nothing${whereSql}`);
    }
    return this;
  }
  /**
   * Adds an `on conflict do update` clause to the query.
   *
   * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
   *
   * @param config The `target`, `set` and `where` clauses.
   *
   * @example
   * ```ts
   * // Update the row if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'Porsche' }
   *   });
   *
   * // Upsert with 'where' clause
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'newBMW' },
   *     where: sql`${cars.createdAt} > '2023-01-01'::date`,
   *   });
   * ```
   */
  onConflictDoUpdate(config) {
    if (config.where && (config.targetWhere || config.setWhere))
      throw new Error(
        'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.'
      );
    this.config.onConflict || (this.config.onConflict = []);
    let whereSql = config.where ? sql4` where ${config.where}` : void 0, targetWhereSql = config.targetWhere ? sql4` where ${config.targetWhere}` : void 0, setWhereSql = config.setWhere ? sql4` where ${config.setWhere}` : void 0, targetSql = Array.isArray(config.target) ? sql4`${config.target}` : sql4`${[config.target]}`, setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
    return this.config.onConflict.push(
      sql4` on conflict ${targetSql}${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`
    ), this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config);
  }
  toSQL() {
    let { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = !0) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run",
      !0,
      void 0,
      {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      }
    );
  }
  prepare() {
    return this._prepare(!1);
  }
  run = (placeholderValues) => this._prepare().run(placeholderValues);
  all = (placeholderValues) => this._prepare().all(placeholderValues);
  get = (placeholderValues) => this._prepare().get(placeholderValues);
  values = (placeholderValues) => this._prepare().values(placeholderValues);
  async execute() {
    return this.config.returning ? this.all() : this.run();
  }
  $dynamic() {
    return this;
  }
};
_a65 = entityKind, __publicField(SQLiteInsertBase, _a65, "SQLiteInsert");

// node_modules/drizzle-orm/sqlite-core/query-builders/update.js
var _a66, SQLiteUpdateBuilder = class {
  constructor(table, session, dialect, withList) {
    this.table = table, this.session = session, this.dialect = dialect, this.withList = withList;
  }
  set(values) {
    return new SQLiteUpdateBase(
      this.table,
      mapUpdateSet(this.table, values),
      this.session,
      this.dialect,
      this.withList
    );
  }
};
_a66 = entityKind, __publicField(SQLiteUpdateBuilder, _a66, "SQLiteUpdateBuilder");
var _a67, SQLiteUpdateBase = class extends QueryPromise {
  constructor(table, set, session, dialect, withList) {
    super(), this.session = session, this.dialect = dialect, this.config = { set, table, withList, joins: [] };
  }
  /** @internal */
  config;
  from(source) {
    return this.config.from = source, this;
  }
  createJoin(joinType) {
    return (table, on) => {
      let tableName = getTableLikeName(table);
      if (typeof tableName == "string" && this.config.joins.some((join) => join.alias === tableName))
        throw new Error(`Alias "${tableName}" is already used in this query`);
      if (typeof on == "function") {
        let from = this.config.from ? is(table, SQLiteTable) ? table[Table.Symbol.Columns] : is(table, Subquery) ? table._.selectedFields : is(table, SQLiteViewBase) ? table[ViewBaseConfig].selectedFields : void 0 : void 0;
        on = on(
          new Proxy(
            this.config.table[Table.Symbol.Columns],
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          ),
          from && new Proxy(
            from,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      return this.config.joins.push({ on, table, joinType, alias: tableName }), this;
    };
  }
  leftJoin = this.createJoin("left");
  rightJoin = this.createJoin("right");
  innerJoin = this.createJoin("inner");
  fullJoin = this.createJoin("full");
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    return this.config.where = where, this;
  }
  orderBy(...columns) {
    if (typeof columns[0] == "function") {
      let orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      ), orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      let orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    return this.config.limit = limit, this;
  }
  returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
    return this.config.returning = orderSelectedFields(fields), this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    let { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(isOneTimeQuery = !0) {
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning,
      this.config.returning ? "all" : "run",
      !0,
      void 0,
      {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      }
    );
  }
  prepare() {
    return this._prepare(!1);
  }
  run = (placeholderValues) => this._prepare().run(placeholderValues);
  all = (placeholderValues) => this._prepare().all(placeholderValues);
  get = (placeholderValues) => this._prepare().get(placeholderValues);
  values = (placeholderValues) => this._prepare().values(placeholderValues);
  async execute() {
    return this.config.returning ? this.all() : this.run();
  }
  $dynamic() {
    return this;
  }
};
_a67 = entityKind, __publicField(SQLiteUpdateBase, _a67, "SQLiteUpdate");

// node_modules/drizzle-orm/sqlite-core/query-builders/count.js
var _a68, _SQLiteCountBuilder = class extends SQL {
  constructor(params) {
    super(_SQLiteCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks), this.params = params, this.session = params.session, this.sql = _SQLiteCountBuilder.buildCount(
      params.source,
      params.filters
    );
  }
  sql;
  [(_a68 = entityKind, Symbol.toStringTag)] = "SQLiteCountBuilderAsync";
  session;
  static buildEmbeddedCount(source, filters) {
    return sql4`(select count(*) from ${source}${sql4.raw(" where ").if(filters)}${filters})`;
  }
  static buildCount(source, filters) {
    return sql4`select count(*) from ${source}${sql4.raw(" where ").if(filters)}${filters}`;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.session.count(this.sql)).then(
      onfulfilled,
      onrejected
    );
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => (onFinally?.(), value),
      (reason) => {
        throw onFinally?.(), reason;
      }
    );
  }
}, SQLiteCountBuilder = _SQLiteCountBuilder;
__publicField(SQLiteCountBuilder, _a68, "SQLiteCountBuilderAsync");

// node_modules/drizzle-orm/sqlite-core/query-builders/query.js
var _a69, RelationalQueryBuilder = class {
  constructor(mode2, fullSchema, schema3, tableNamesMap, table, tableConfig, dialect, session) {
    this.mode = mode2, this.fullSchema = fullSchema, this.schema = schema3, this.tableNamesMap = tableNamesMap, this.table = table, this.tableConfig = tableConfig, this.dialect = dialect, this.session = session;
  }
  findMany(config) {
    return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config || {},
      "many"
    ) : new SQLiteRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config || {},
      "many"
    );
  }
  findFirst(config) {
    return this.mode === "sync" ? new SQLiteSyncRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    ) : new SQLiteRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    );
  }
};
_a69 = entityKind, __publicField(RelationalQueryBuilder, _a69, "SQLiteAsyncRelationalQueryBuilder");
var _a70, SQLiteRelationalQuery = class extends QueryPromise {
  constructor(fullSchema, schema3, tableNamesMap, table, tableConfig, dialect, session, config, mode2) {
    super(), this.fullSchema = fullSchema, this.schema = schema3, this.tableNamesMap = tableNamesMap, this.table = table, this.tableConfig = tableConfig, this.dialect = dialect, this.session = session, this.config = config, this.mode = mode2;
  }
  /** @internal */
  mode;
  /** @internal */
  getSQL() {
    return this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    }).sql;
  }
  /** @internal */
  _prepare(isOneTimeQuery = !1) {
    let { query, builtQuery } = this._toSQL();
    return this.session[isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"](
      builtQuery,
      void 0,
      this.mode === "first" ? "get" : "all",
      !0,
      (rawRows, mapColumnValue) => {
        let rows = rawRows.map(
          (row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
        );
        return this.mode === "first" ? rows[0] : rows;
      }
    );
  }
  prepare() {
    return this._prepare(!1);
  }
  _toSQL() {
    let query = this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    }), builtQuery = this.dialect.sqlToQuery(query.sql);
    return { query, builtQuery };
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  /** @internal */
  executeRaw() {
    return this.mode === "first" ? this._prepare(!1).get() : this._prepare(!1).all();
  }
  async execute() {
    return this.executeRaw();
  }
};
_a70 = entityKind, __publicField(SQLiteRelationalQuery, _a70, "SQLiteAsyncRelationalQuery");
var _a71, SQLiteSyncRelationalQuery = class extends SQLiteRelationalQuery {
  sync() {
    return this.executeRaw();
  }
};
_a71 = entityKind, __publicField(SQLiteSyncRelationalQuery, _a71, "SQLiteSyncRelationalQuery");

// node_modules/drizzle-orm/sqlite-core/query-builders/raw.js
var _a72, SQLiteRaw = class extends QueryPromise {
  constructor(execute, getSQL, action26, dialect, mapBatchResult) {
    super(), this.execute = execute, this.getSQL = getSQL, this.dialect = dialect, this.mapBatchResult = mapBatchResult, this.config = { action: action26 };
  }
  /** @internal */
  config;
  getQuery() {
    return { ...this.dialect.sqlToQuery(this.getSQL()), method: this.config.action };
  }
  mapResult(result, isFromBatch) {
    return isFromBatch ? this.mapBatchResult(result) : result;
  }
  _prepare() {
    return this;
  }
  /** @internal */
  isResponseInArrayMode() {
    return !1;
  }
};
_a72 = entityKind, __publicField(SQLiteRaw, _a72, "SQLiteRaw");

// node_modules/drizzle-orm/sqlite-core/db.js
var _a73, BaseSQLiteDatabase = class {
  constructor(resultKind, dialect, session, schema3) {
    this.resultKind = resultKind, this.dialect = dialect, this.session = session, this._ = schema3 ? {
      schema: schema3.schema,
      fullSchema: schema3.fullSchema,
      tableNamesMap: schema3.tableNamesMap
    } : {
      schema: void 0,
      fullSchema: {},
      tableNamesMap: {}
    }, this.query = {};
    let query = this.query;
    if (this._.schema)
      for (let [tableName, columns] of Object.entries(this._.schema))
        query[tableName] = new RelationalQueryBuilder(
          resultKind,
          schema3.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema3.fullSchema[tableName],
          columns,
          dialect,
          session
        );
    this.$cache = { invalidate: async (_params) => {
    } };
  }
  query;
  /**
   * Creates a subquery that defines a temporary named result set as a CTE.
   *
   * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param alias The alias for the subquery.
   *
   * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
   *
   * @example
   *
   * ```ts
   * // Create a subquery with alias 'sq' and use it in the select query
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * const result = await db.with(sq).select().from(sq);
   * ```
   *
   * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
   *
   * ```ts
   * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
   * const sq = db.$with('sq').as(db.select({
   *   name: sql<string>`upper(${users.name})`.as('name'),
   * })
   * .from(users));
   *
   * const result = await db.with(sq).select({ name: sq.name }).from(sq);
   * ```
   */
  $with = (alias, selection) => {
    let self2 = this;
    return { as: (qb) => (typeof qb == "function" && (qb = qb(new QueryBuilder(self2.dialect))), new Proxy(
      new WithSubquery(
        qb.getSQL(),
        selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
        alias,
        !0
      ),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    )) };
  };
  $count(source, filters) {
    return new SQLiteCountBuilder({ source, filters, session: this.session });
  }
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    let self2 = this;
    function select(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: self2.session,
        dialect: self2.dialect,
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new SQLiteSelectBuilder({
        fields: fields ?? void 0,
        session: self2.session,
        dialect: self2.dialect,
        withList: queries,
        distinct: !0
      });
    }
    function update(table) {
      return new SQLiteUpdateBuilder(table, self2.session, self2.dialect, queries);
    }
    function insert(into) {
      return new SQLiteInsertBuilder(into, self2.session, self2.dialect, queries);
    }
    function delete_(from) {
      return new SQLiteDeleteBase(from, self2.session, self2.dialect, queries);
    }
    return { select, selectDistinct, update, insert, delete: delete_ };
  }
  select(fields) {
    return new SQLiteSelectBuilder({ fields: fields ?? void 0, session: this.session, dialect: this.dialect });
  }
  selectDistinct(fields) {
    return new SQLiteSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: !0
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   *
   * // Update with returning clause
   * const updatedCar: Car[] = await db.update(cars)
   *   .set({ color: 'red' })
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  update(table) {
    return new SQLiteUpdateBuilder(table, this.session, this.dialect);
  }
  $cache;
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   *
   * // Insert with returning clause
   * const insertedCar: Car[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning();
   * ```
   */
  insert(into) {
    return new SQLiteInsertBuilder(into, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   *
   * // Delete with returning clause
   * const deletedCar: Car[] = await db.delete(cars)
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  delete(from) {
    return new SQLiteDeleteBase(from, this.session, this.dialect);
  }
  run(query) {
    let sequel = typeof query == "string" ? sql4.raw(query) : query.getSQL();
    return this.resultKind === "async" ? new SQLiteRaw(
      async () => this.session.run(sequel),
      () => sequel,
      "run",
      this.dialect,
      this.session.extractRawRunValueFromBatchResult.bind(this.session)
    ) : this.session.run(sequel);
  }
  all(query) {
    let sequel = typeof query == "string" ? sql4.raw(query) : query.getSQL();
    return this.resultKind === "async" ? new SQLiteRaw(
      async () => this.session.all(sequel),
      () => sequel,
      "all",
      this.dialect,
      this.session.extractRawAllValueFromBatchResult.bind(this.session)
    ) : this.session.all(sequel);
  }
  get(query) {
    let sequel = typeof query == "string" ? sql4.raw(query) : query.getSQL();
    return this.resultKind === "async" ? new SQLiteRaw(
      async () => this.session.get(sequel),
      () => sequel,
      "get",
      this.dialect,
      this.session.extractRawGetValueFromBatchResult.bind(this.session)
    ) : this.session.get(sequel);
  }
  values(query) {
    let sequel = typeof query == "string" ? sql4.raw(query) : query.getSQL();
    return this.resultKind === "async" ? new SQLiteRaw(
      async () => this.session.values(sequel),
      () => sequel,
      "values",
      this.dialect,
      this.session.extractRawValuesValueFromBatchResult.bind(this.session)
    ) : this.session.values(sequel);
  }
  transaction(transaction, config) {
    return this.session.transaction(transaction, config);
  }
};
_a73 = entityKind, __publicField(BaseSQLiteDatabase, _a73, "BaseSQLiteDatabase");

// node_modules/drizzle-orm/cache/core/cache.js
var _a74, Cache = class {
};
_a74 = entityKind, __publicField(Cache, _a74, "Cache");
var _a75, NoopCache = class extends Cache {
  strategy() {
    return "all";
  }
  async get(_key) {
  }
  async put(_hashedQuery, _response, _tables, _config) {
  }
  async onMutate(_params) {
  }
};
_a75 = entityKind, __publicField(NoopCache, _a75, "NoopCache");
async function hashQuery(sql11, params) {
  let dataToHash = `${sql11}-${JSON.stringify(params)}`, data = new TextEncoder().encode(dataToHash), hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// node_modules/drizzle-orm/errors/index.js
var DrizzleQueryError = class extends Error {
  constructor(query, params, cause) {
    super(`Failed query: ${query}
params: ${params}`), this.query = query, this.params = params, this.cause = cause, Error.captureStackTrace(this, DrizzleQueryError), cause && (this.cause = cause);
  }
};

// node_modules/drizzle-orm/sqlite-core/session.js
var _a76, ExecuteResultSync = class extends QueryPromise {
  constructor(resultCb) {
    super(), this.resultCb = resultCb;
  }
  async execute() {
    return this.resultCb();
  }
  sync() {
    return this.resultCb();
  }
};
_a76 = entityKind, __publicField(ExecuteResultSync, _a76, "ExecuteResultSync");
var _a77, SQLitePreparedQuery = class {
  constructor(mode2, executeMethod, query, cache, queryMetadata, cacheConfig) {
    this.mode = mode2, this.executeMethod = executeMethod, this.query = query, this.cache = cache, this.queryMetadata = queryMetadata, this.cacheConfig = cacheConfig, cache && cache.strategy() === "all" && cacheConfig === void 0 && (this.cacheConfig = { enable: !0, autoInvalidate: !0 }), this.cacheConfig?.enable || (this.cacheConfig = void 0);
  }
  /** @internal */
  joinsNotNullableMap;
  /** @internal */
  async queryWithCache(queryString, params, query) {
    if (this.cache === void 0 || is(this.cache, NoopCache) || this.queryMetadata === void 0)
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    if (this.cacheConfig && !this.cacheConfig.enable)
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0)
      try {
        let [res] = await Promise.all([
          query(),
          this.cache.onMutate({ tables: this.queryMetadata.tables })
        ]);
        return res;
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    if (!this.cacheConfig)
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    if (this.queryMetadata.type === "select") {
      let fromCache = await this.cache.get(
        this.cacheConfig.tag ?? await hashQuery(queryString, params),
        this.queryMetadata.tables,
        this.cacheConfig.tag !== void 0,
        this.cacheConfig.autoInvalidate
      );
      if (fromCache === void 0) {
        let result;
        try {
          result = await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
        return await this.cache.put(
          this.cacheConfig.tag ?? await hashQuery(queryString, params),
          result,
          // make sure we send tables that were used in a query only if user wants to invalidate it on each write
          this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
          this.cacheConfig.tag !== void 0,
          this.cacheConfig.config
        ), result;
      }
      return fromCache;
    }
    try {
      return await query();
    } catch (e) {
      throw new DrizzleQueryError(queryString, params, e);
    }
  }
  getQuery() {
    return this.query;
  }
  mapRunResult(result, _isFromBatch) {
    return result;
  }
  mapAllResult(_result, _isFromBatch) {
    throw new Error("Not implemented");
  }
  mapGetResult(_result, _isFromBatch) {
    throw new Error("Not implemented");
  }
  execute(placeholderValues) {
    return this.mode === "async" ? this[this.executeMethod](placeholderValues) : new ExecuteResultSync(() => this[this.executeMethod](placeholderValues));
  }
  mapResult(response, isFromBatch) {
    switch (this.executeMethod) {
      case "run":
        return this.mapRunResult(response, isFromBatch);
      case "all":
        return this.mapAllResult(response, isFromBatch);
      case "get":
        return this.mapGetResult(response, isFromBatch);
    }
  }
};
_a77 = entityKind, __publicField(SQLitePreparedQuery, _a77, "PreparedQuery");
var _a78, SQLiteSession = class {
  constructor(dialect) {
    this.dialect = dialect;
  }
  prepareOneTimeQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    return this.prepareQuery(
      query,
      fields,
      executeMethod,
      isResponseInArrayMode,
      customResultMapper,
      queryMetadata,
      cacheConfig
    );
  }
  run(query) {
    let staticQuery = this.dialect.sqlToQuery(query);
    try {
      return this.prepareOneTimeQuery(staticQuery, void 0, "run", !1).run();
    } catch (err) {
      throw new DrizzleError({ cause: err, message: `Failed to run the query '${staticQuery.sql}'` });
    }
  }
  /** @internal */
  extractRawRunValueFromBatchResult(result) {
    return result;
  }
  all(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", !1).all();
  }
  /** @internal */
  extractRawAllValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
  get(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", !1).get();
  }
  /** @internal */
  extractRawGetValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
  values(query) {
    return this.prepareOneTimeQuery(this.dialect.sqlToQuery(query), void 0, "run", !1).values();
  }
  async count(sql11) {
    return (await this.values(sql11))[0][0];
  }
  /** @internal */
  extractRawValuesValueFromBatchResult(_result) {
    throw new Error("Not implemented");
  }
};
_a78 = entityKind, __publicField(SQLiteSession, _a78, "SQLiteSession");
var _a79, SQLiteTransaction = class extends BaseSQLiteDatabase {
  constructor(resultType, dialect, session, schema3, nestedIndex = 0) {
    super(resultType, dialect, session, schema3), this.schema = schema3, this.nestedIndex = nestedIndex;
  }
  rollback() {
    throw new TransactionRollbackError();
  }
};
_a79 = entityKind, __publicField(SQLiteTransaction, _a79, "SQLiteTransaction");

// node_modules/drizzle-orm/d1/session.js
var _a80, SQLiteD1Session = class extends SQLiteSession {
  constructor(client, dialect, schema3, options = {}) {
    super(dialect), this.client = client, this.schema = schema3, this.options = options, this.logger = options.logger ?? new NoopLogger(), this.cache = options.cache ?? new NoopCache();
  }
  logger;
  cache;
  prepareQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    let stmt = this.client.prepare(query.sql);
    return new D1PreparedQuery(
      stmt,
      query,
      this.logger,
      this.cache,
      queryMetadata,
      cacheConfig,
      fields,
      executeMethod,
      isResponseInArrayMode,
      customResultMapper
    );
  }
  async batch(queries) {
    let preparedQueries = [], builtQueries = [];
    for (let query of queries) {
      let preparedQuery = query._prepare(), builtQuery = preparedQuery.getQuery();
      if (preparedQueries.push(preparedQuery), builtQuery.params.length > 0)
        builtQueries.push(preparedQuery.stmt.bind(...builtQuery.params));
      else {
        let builtQuery2 = preparedQuery.getQuery();
        builtQueries.push(
          this.client.prepare(builtQuery2.sql).bind(...builtQuery2.params)
        );
      }
    }
    return (await this.client.batch(builtQueries)).map((result, i) => preparedQueries[i].mapResult(result, !0));
  }
  extractRawAllValueFromBatchResult(result) {
    return result.results;
  }
  extractRawGetValueFromBatchResult(result) {
    return result.results[0];
  }
  extractRawValuesValueFromBatchResult(result) {
    return d1ToRawMapping(result.results);
  }
  async transaction(transaction, config) {
    let tx = new D1Transaction("async", this.dialect, this, this.schema);
    await this.run(sql4.raw(`begin${config?.behavior ? " " + config.behavior : ""}`));
    try {
      let result = await transaction(tx);
      return await this.run(sql4`commit`), result;
    } catch (err) {
      throw await this.run(sql4`rollback`), err;
    }
  }
};
_a80 = entityKind, __publicField(SQLiteD1Session, _a80, "SQLiteD1Session");
var _a81, _D1Transaction = class extends SQLiteTransaction {
  async transaction(transaction) {
    let savepointName = `sp${this.nestedIndex}`, tx = new _D1Transaction("async", this.dialect, this.session, this.schema, this.nestedIndex + 1);
    await this.session.run(sql4.raw(`savepoint ${savepointName}`));
    try {
      let result = await transaction(tx);
      return await this.session.run(sql4.raw(`release savepoint ${savepointName}`)), result;
    } catch (err) {
      throw await this.session.run(sql4.raw(`rollback to savepoint ${savepointName}`)), err;
    }
  }
}, D1Transaction = _D1Transaction;
_a81 = entityKind, __publicField(D1Transaction, _a81, "D1Transaction");
function d1ToRawMapping(results) {
  let rows = [];
  for (let row of results) {
    let entry2 = Object.keys(row).map((k) => row[k]);
    rows.push(entry2);
  }
  return rows;
}
var _a82, D1PreparedQuery = class extends SQLitePreparedQuery {
  constructor(stmt, query, logger, cache, queryMetadata, cacheConfig, fields, executeMethod, _isResponseInArrayMode, customResultMapper) {
    super("async", executeMethod, query, cache, queryMetadata, cacheConfig), this.logger = logger, this._isResponseInArrayMode = _isResponseInArrayMode, this.customResultMapper = customResultMapper, this.fields = fields, this.stmt = stmt;
  }
  /** @internal */
  customResultMapper;
  /** @internal */
  fields;
  /** @internal */
  stmt;
  async run(placeholderValues) {
    let params = fillPlaceholders(this.query.params, placeholderValues ?? {});
    return this.logger.logQuery(this.query.sql, params), await this.queryWithCache(this.query.sql, params, async () => this.stmt.bind(...params).run());
  }
  async all(placeholderValues) {
    let { fields, query, logger, stmt, customResultMapper } = this;
    if (!fields && !customResultMapper) {
      let params = fillPlaceholders(query.params, placeholderValues ?? {});
      return logger.logQuery(query.sql, params), await this.queryWithCache(query.sql, params, async () => stmt.bind(...params).all().then(({ results }) => this.mapAllResult(results)));
    }
    let rows = await this.values(placeholderValues);
    return this.mapAllResult(rows);
  }
  mapAllResult(rows, isFromBatch) {
    return isFromBatch && (rows = d1ToRawMapping(rows.results)), !this.fields && !this.customResultMapper ? rows : this.customResultMapper ? this.customResultMapper(rows) : rows.map((row) => mapResultRow(this.fields, row, this.joinsNotNullableMap));
  }
  async get(placeholderValues) {
    let { fields, joinsNotNullableMap, query, logger, stmt, customResultMapper } = this;
    if (!fields && !customResultMapper) {
      let params = fillPlaceholders(query.params, placeholderValues ?? {});
      return logger.logQuery(query.sql, params), await this.queryWithCache(query.sql, params, async () => stmt.bind(...params).all().then(({ results }) => results[0]));
    }
    let rows = await this.values(placeholderValues);
    if (rows[0])
      return customResultMapper ? customResultMapper(rows) : mapResultRow(fields, rows[0], joinsNotNullableMap);
  }
  mapGetResult(result, isFromBatch) {
    return isFromBatch && (result = d1ToRawMapping(result.results)[0]), !this.fields && !this.customResultMapper ? result : this.customResultMapper ? this.customResultMapper([result]) : mapResultRow(this.fields, result, this.joinsNotNullableMap);
  }
  async values(placeholderValues) {
    let params = fillPlaceholders(this.query.params, placeholderValues ?? {});
    return this.logger.logQuery(this.query.sql, params), await this.queryWithCache(this.query.sql, params, async () => this.stmt.bind(...params).raw());
  }
  /** @internal */
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
};
_a82 = entityKind, __publicField(D1PreparedQuery, _a82, "D1PreparedQuery");

// node_modules/drizzle-orm/d1/driver.js
var _a83, DrizzleD1Database = class extends BaseSQLiteDatabase {
  async batch(batch) {
    return this.session.batch(batch);
  }
};
_a83 = entityKind, __publicField(DrizzleD1Database, _a83, "D1Database");
function drizzle(client, config = {}) {
  let dialect = new SQLiteAsyncDialect({ casing: config.casing }), logger;
  config.logger === !0 ? logger = new DefaultLogger() : config.logger !== !1 && (logger = config.logger);
  let schema3;
  if (config.schema) {
    let tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers
    );
    schema3 = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  let session = new SQLiteD1Session(client, dialect, schema3, { logger, cache: config.cache }), db = new DrizzleD1Database("async", dialect, session, schema3);
  return db.$client = client, db.$cache = config.cache, db.$cache && (db.$cache.invalidate = config.cache?.onMutate), db;
}

// app/utils/db.server.ts
init_schema();
function createDb(d1) {
  return drizzle(d1, { schema: schema_exports });
}

// app/root.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css?family=Tangerine"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.cdnfonts.com/css/self-deception"
  },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" },
  // Favicon configuration - portal.ask logo
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/logo.png" },
  { rel: "shortcut icon", href: "/favicon.svg" }
];
function ErrorBoundary() {
  let error = useRouteError(), errorTitle = "Something went wrong", errorMessage = "An unexpected error occurred. Please try again later.", errorStatus = 500, is404 = !1;
  return isRouteErrorResponse(error) ? (errorStatus = error.status, is404 = error.status === 404, is404 ? (errorTitle = "Page Not Found", errorMessage = "The page you're looking for doesn't exist or has been moved.") : error.status === 401 ? (errorTitle = "Unauthorized", errorMessage = "You need to be logged in to access this page.") : error.status === 403 ? (errorTitle = "Access Denied", errorMessage = "You don't have permission to access this page.") : error.status === 500 ? (errorTitle = "Server Error", errorMessage = "Something went wrong on our end. Please try again later.") : (errorTitle = `Error ${error.status}`, errorMessage = error.data?.message || error.statusText || "An error occurred.")) : error instanceof Error && (errorTitle = "Application Error", errorMessage = error.message || "An unexpected error occurred."), /* @__PURE__ */ jsxs("html", { lang: "en", className: "h-full bg-neutral-900", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx3("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx3("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsxs("title", { children: [
        errorTitle,
        " - portal.ask"
      ] }),
      /* @__PURE__ */ jsx3(Meta, {}),
      /* @__PURE__ */ jsx3(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "h-full", children: [
      /* @__PURE__ */ jsx3("div", { className: "h-screen w-full bg-neutral-900 flex flex-col items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-lg shadow-lg border border-red-500/30", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx3("div", { className: "mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6", children: is404 ? /* @__PURE__ */ jsx3("svg", { className: "h-8 w-8 text-red-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" }) }) : /* @__PURE__ */ jsx3("svg", { className: "h-8 w-8 text-red-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx3("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }),
          /* @__PURE__ */ jsx3("h1", { className: "text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-4", children: errorTitle }),
          /* @__PURE__ */ jsx3("p", { className: "text-gray-400 mb-8 leading-relaxed", children: errorMessage }),
          !1
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-3", children: [
          /* @__PURE__ */ jsx3(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
              children: "Try Again"
            }
          ),
          /* @__PURE__ */ jsx3(
            "a",
            {
              href: "/",
              className: "w-full py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-center",
              children: "Return Home"
            }
          ),
          !is404 && /* @__PURE__ */ jsx3(
            "button",
            {
              onClick: () => window.history.back(),
              className: "w-full py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors",
              children: "Go Back"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center pt-4 border-t border-neutral-700", children: [
          /* @__PURE__ */ jsx3("p", { className: "text-xs text-gray-500 mb-2", children: "Still having trouble?" }),
          /* @__PURE__ */ jsx3(
            "a",
            {
              href: "mailto:support@xportal.com",
              className: "text-xs text-indigo-400 hover:text-indigo-300 transition-colors",
              children: "Contact Support"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx3(Scripts, {})
    ] })
  ] });
}
var loader = async ({ request, context }) => {
  if (!context || !context.env || !context.env.DB)
    throw new Error("D1 Database binding is missing from context.env.DB");
  let db = createDb(context.env.DB);
  return context.env.SESSION_SECRET && (global.SESSION_SECRET = context.env.SESSION_SECRET), json({
    user: await getUser(request, db)
  });
};
function WalletModalHandler() {
  return useEffect2(() => {
    let handleClickOutside = (event) => {
      let modal = document.querySelector(".wallet-adapter-modal"), modalWrapper = document.querySelector(".wallet-adapter-modal-wrapper");
      if (modal && modalWrapper && !modalWrapper.contains(event.target)) {
        let closeButton = modal.querySelector(".wallet-adapter-modal-button-close");
        closeButton && closeButton.click();
      }
    }, handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        let modal = document.querySelector(".wallet-adapter-modal");
        if (modal) {
          let closeButton = modal.querySelector(".wallet-adapter-modal-button-close");
          closeButton && closeButton.click();
        }
      }
    };
    return document.addEventListener("mousedown", handleClickOutside), document.addEventListener("keydown", handleEscapeKey), () => {
      document.removeEventListener("mousedown", handleClickOutside), document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []), null;
}
function App() {
  let { user } = useLoaderData(), location = useLocation(), isClient = typeof window < "u";
  return useEffect2(() => {
    if (isClient) {
      let originalOnError = window.onerror;
      window.onerror = (event) => event.toString().includes("access to storage is not allowed") ? !0 : originalOnError ? originalOnError(event) : !1;
    }
  }, [isClient, location]), /* @__PURE__ */ jsxs("html", { lang: "en", className: "h-full bg-neutral-900", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx3("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx3("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx3(Meta, {}),
      /* @__PURE__ */ jsx3(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "h-full", children: [
      /* @__PURE__ */ jsxs(WalletProvider, { children: [
        /* @__PURE__ */ jsx3(WalletModalHandler, {}),
        /* @__PURE__ */ jsx3(Outlet, { context: { user } })
      ] }),
      /* @__PURE__ */ jsx3(ScrollRestoration, {}),
      /* @__PURE__ */ jsx3(Scripts, {})
    ] })
  ] });
}

// app/routes/api.wallet.cancel-transaction.tsx
var api_wallet_cancel_transaction_exports = {};
__export(api_wallet_cancel_transaction_exports, {
  action: () => action
});
import { json as json2 } from "@remix-run/cloudflare";
init_virtual_wallet_server();
async function action({ request, context }) {
  let db = createDb(context.env.DB);
  if (!await getUser(request, db))
    return json2({ success: !1, error: "Unauthorized" }, { status: 401 });
  let transactionId = (await request.formData()).get("transactionId");
  if (!transactionId)
    return json2({ success: !1, error: "Transaction ID required" }, { status: 400 });
  try {
    return await cancelTransaction(db, transactionId) ? json2({ success: !0, message: "Transaction cancelled successfully" }) : json2({ success: !1, error: "Failed to cancel transaction" }, { status: 400 });
  } catch {
    return json2({ success: !1, error: "Failed to cancel transaction" }, { status: 500 });
  }
}

// app/routes/api.comments.$commentId.vote.tsx
var api_comments_commentId_vote_exports = {};
__export(api_comments_commentId_vote_exports, {
  action: () => action2
});
init_schema();
import { json as json3 } from "@remix-run/cloudflare";
import { eq as eq5, and as and4 } from "drizzle-orm";
async function action2({ request, params, context }) {
  let { commentId } = params;
  if (!commentId)
    return json3({ error: "Comment ID is required" }, { status: 400 });
  let formData = await request.formData(), userId = formData.get("userId"), value = parseInt(formData.get("value")), voteType = formData.get("voteType"), isQualityVote = formData.get("isQualityVote") === "true";
  if (!userId || isNaN(value) || !voteType)
    return json3({ error: "Missing required fields" }, { status: 400 });
  try {
    let db = context.env.DB, existingVote = await db.select().from(votes).where(
      and4(
        eq5(votes.commentId, commentId),
        eq5(votes.userId, userId),
        eq5(votes.voteType, voteType)
      )
    ).limit(1), totalVotes = 0, upvotes = 0, downvotes = 0;
    existingVote.length > 0 ? await db.update(votes).set({
      value,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(votes.id, existingVote[0].id)) : await db.insert(votes).values({
      id: crypto.randomUUID(),
      commentId,
      userId,
      value,
      voteType,
      isQualityVote,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }), (await db.select({
      totalVotes: votes.value,
      upvotes: votes.value,
      downvotes: votes.value
    }).from(votes).where(
      and4(
        eq5(votes.commentId, commentId),
        eq5(votes.voteType, voteType)
      )
    )).forEach((vote) => {
      totalVotes += vote.totalVotes, vote.upvotes > 0 && (upvotes += vote.upvotes), vote.downvotes < 0 && (downvotes += Math.abs(vote.downvotes));
    });
    let updateData = {};
    return voteType === "comment" && (updateData.upvotes = upvotes, updateData.downvotes = downvotes), await db.update(comments).set(updateData).where(eq5(comments.id, commentId)), json3({
      success: !0,
      totalVotes,
      upvotes,
      downvotes
    });
  } catch (error) {
    return console.error("Error processing comment vote:", error), json3({ error: "Failed to process vote" }, { status: 500 });
  }
}

// app/routes/api.answers.$answerId.vote.tsx
var api_answers_answerId_vote_exports = {};
__export(api_answers_answerId_vote_exports, {
  action: () => action3
});
init_schema();
import { json as json4 } from "@remix-run/cloudflare";
import { eq as eq6, and as and5 } from "drizzle-orm";
async function action3({ request, params, context }) {
  let { answerId } = params;
  if (!answerId)
    return json4({ error: "Answer ID is required" }, { status: 400 });
  let formData = await request.formData(), userId = formData.get("userId"), value = parseInt(formData.get("value")), voteType = formData.get("voteType"), isQualityVote = formData.get("isQualityVote") === "true";
  if (!userId || isNaN(value) || !voteType)
    return json4({ error: "Missing required fields" }, { status: 400 });
  try {
    let db = context.env.DB, existingVote = await db.select().from(votes).where(
      and5(
        eq6(votes.answerId, answerId),
        eq6(votes.userId, userId),
        eq6(votes.voteType, voteType)
      )
    ).limit(1), totalVotes = 0, upvotes = 0, downvotes = 0;
    existingVote.length > 0 ? await db.update(votes).set({
      value,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq6(votes.id, existingVote[0].id)) : await db.insert(votes).values({
      id: crypto.randomUUID(),
      answerId,
      userId,
      value,
      voteType,
      isQualityVote,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }), (await db.select({
      totalVotes: votes.value,
      upvotes: votes.value,
      downvotes: votes.value
    }).from(votes).where(
      and5(
        eq6(votes.answerId, answerId),
        eq6(votes.voteType, voteType)
      )
    )).forEach((vote) => {
      totalVotes += vote.totalVotes, vote.upvotes > 0 && (upvotes += vote.upvotes), vote.downvotes < 0 && (downvotes += Math.abs(vote.downvotes));
    });
    let updateData = {};
    return voteType === "answer" && (updateData.upvotes = upvotes, updateData.downvotes = downvotes), await db.update(answers).set(updateData).where(eq6(answers.id, answerId)), json4({
      success: !0,
      totalVotes,
      upvotes,
      downvotes
    });
  } catch (error) {
    return console.error("Error processing answer vote:", error), json4({ error: "Failed to process vote" }, { status: 500 });
  }
}

// app/routes/api.wallet.confirm-deposit.tsx
var api_wallet_confirm_deposit_exports = {};
__export(api_wallet_confirm_deposit_exports, {
  action: () => action4
});
import { json as json5 } from "@remix-run/cloudflare";
init_virtual_wallet_server();
import { z } from "zod";
var confirmDepositSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  solanaSignature: z.string().min(1, "Solana signature is required")
});
async function action4({ request, context }) {
  try {
    let userId = await requireUserId(request), formData = await request.formData(), validation = confirmDepositSchema.safeParse({
      transactionId: formData.get("transactionId"),
      solanaSignature: formData.get("solanaSignature")
    });
    if (!validation.success)
      return json5({ error: validation.error.errors[0].message }, { status: 400 });
    let { transactionId, solanaSignature } = validation.data, db = createDb(context.env.DB), result = await confirmDeposit(db, transactionId, solanaSignature);
    return json5({
      success: !0,
      transaction: result,
      message: "Deposit confirmed successfully"
    });
  } catch (error) {
    return console.error("Confirm deposit error:", error), json5({ error: "Failed to confirm deposit" }, { status: 500 });
  }
}

// app/routes/api.posts.$postId.vote.tsx
var api_posts_postId_vote_exports = {};
__export(api_posts_postId_vote_exports, {
  action: () => action5
});
init_schema();
import { json as json6 } from "@remix-run/cloudflare";
import { eq as eq7, and as and6 } from "drizzle-orm";
async function action5({ request, params, context }) {
  let { postId } = params;
  if (!postId)
    return json6({ error: "Post ID is required" }, { status: 400 });
  let formData = await request.formData(), userId = formData.get("userId"), value = parseInt(formData.get("value")), voteType = formData.get("voteType"), isQualityVote = formData.get("isQualityVote") === "true";
  if (!userId || isNaN(value) || !voteType)
    return json6({ error: "Missing required fields" }, { status: 400 });
  try {
    let db = context.env.DB, existingVote = await db.select().from(votes).where(
      and6(
        eq7(votes.postId, postId),
        eq7(votes.userId, userId),
        eq7(votes.voteType, voteType)
      )
    ).limit(1), totalVotes = 0, qualityUpvotes = 0, qualityDownvotes = 0;
    existingVote.length > 0 ? await db.update(votes).set({
      value,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq7(votes.id, existingVote[0].id)) : await db.insert(votes).values({
      id: crypto.randomUUID(),
      postId,
      userId,
      value,
      voteType,
      isQualityVote,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }), (await db.select({
      totalVotes: votes.value,
      qualityUpvotes: votes.value,
      qualityDownvotes: votes.value
    }).from(votes).where(
      and6(
        eq7(votes.postId, postId),
        eq7(votes.voteType, voteType)
      )
    )).forEach((vote) => {
      totalVotes += vote.totalVotes, vote.qualityUpvotes > 0 && (qualityUpvotes += vote.qualityUpvotes), vote.qualityDownvotes < 0 && (qualityDownvotes += Math.abs(vote.qualityDownvotes));
    });
    let updateData = {};
    return voteType === "visibility" ? updateData.visibilityVotes = totalVotes : voteType === "quality" && (updateData.qualityUpvotes = qualityUpvotes, updateData.qualityDownvotes = qualityDownvotes), await db.update(posts).set(updateData).where(eq7(posts.id, postId)), json6({
      success: !0,
      totalVotes,
      qualityUpvotes,
      qualityDownvotes
    });
  } catch (error) {
    return console.error("Error processing vote:", error), json6({ error: "Failed to process vote" }, { status: 500 });
  }
}

// app/routes/api.bookmarks-status.tsx
var api_bookmarks_status_exports = {};
__export(api_bookmarks_status_exports, {
  action: () => action6,
  loader: () => loader2
});
init_schema();
import { json as json7 } from "@remix-run/cloudflare";
import { eq as eq8, and as and7 } from "drizzle-orm";
async function loader2({ request, context }) {
  let url = new URL(request.url), postId = url.searchParams.get("postId"), userId = url.searchParams.get("userId");
  if (!postId || !userId)
    return json7({ error: "Missing postId or userId" }, { status: 400 });
  try {
    let db = context.env.DB;
    if (!db)
      return console.error("Database is undefined in bookmarks-status loader"), json7({ error: "Database connection not available" }, { status: 500 });
    let isBookmarked = (await db.select().from(bookmarks).where(
      and7(
        eq8(bookmarks.postId, postId),
        eq8(bookmarks.userId, userId)
      )
    ).limit(1)).length > 0;
    return json7({ isBookmarked });
  } catch (error) {
    return console.error("Error checking bookmark status:", error), json7({ error: "Failed to check bookmark status" }, { status: 500 });
  }
}
async function action6({ request, context }) {
  let formData = await request.formData(), postId = formData.get("postId"), userId = formData.get("userId"), action26 = formData.get("action");
  if (!postId || !userId || !action26)
    return json7({ error: "Missing required fields" }, { status: 400 });
  try {
    let db = context.env.DB;
    return db ? action26 === "toggle" ? (await db.select().from(bookmarks).where(
      and7(
        eq8(bookmarks.postId, postId),
        eq8(bookmarks.userId, userId)
      )
    ).limit(1)).length > 0 ? (await db.delete(bookmarks).where(
      and7(
        eq8(bookmarks.postId, postId),
        eq8(bookmarks.userId, userId)
      )
    ), json7({ isBookmarked: !1 })) : (await db.insert(bookmarks).values({
      id: crypto.randomUUID(),
      postId,
      userId,
      createdAt: /* @__PURE__ */ new Date()
    }), json7({ isBookmarked: !0 })) : json7({ error: "Invalid action" }, { status: 400 }) : (console.error("Database is undefined in bookmarks-status action"), json7({ error: "Database connection not available" }, { status: 500 }));
  } catch (error) {
    return console.error("Error toggling bookmark:", error), json7({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}

// app/routes/api.bookmarks-toggle.tsx
var api_bookmarks_toggle_exports = {};
__export(api_bookmarks_toggle_exports, {
  action: () => action7
});
import { json as json8 } from "@remix-run/cloudflare";

// app/utils/bookmark.server.ts
init_schema();
import { eq as eq9, and as and8 } from "drizzle-orm";
async function toggleBookmark(db, postId, userId) {
  return (await db.select().from(bookmarks).where(
    and8(
      eq9(bookmarks.postId, postId),
      eq9(bookmarks.userId, userId)
    )
  ).limit(1)).length > 0 ? (await db.delete(bookmarks).where(
    and8(
      eq9(bookmarks.postId, postId),
      eq9(bookmarks.userId, userId)
    )
  ), { bookmarked: !1 }) : (await db.insert(bookmarks).values({
    id: crypto.randomUUID(),
    postId,
    userId,
    createdAt: /* @__PURE__ */ new Date()
  }), { bookmarked: !0 });
}
async function getUserBookmarks(db, userId) {
  if (!db)
    return console.error("Database is undefined in getUserBookmarks"), [];
  try {
    return await db.select({
      id: bookmarks.id,
      postId: bookmarks.postId,
      createdAt: bookmarks.createdAt,
      post: {
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.authorId
      },
      user: {
        id: users.id,
        username: users.username
      },
      profile: {
        profilePicture: profiles.profilePicture
      }
    }).from(bookmarks).innerJoin(posts, eq9(bookmarks.postId, posts.id)).innerJoin(users, eq9(posts.authorId, users.id)).leftJoin(profiles, eq9(users.id, profiles.userId)).where(eq9(bookmarks.userId, userId)).orderBy(bookmarks.createdAt);
  } catch (error) {
    return console.error("Error fetching user bookmarks:", error), [];
  }
}

// app/routes/api.bookmarks-toggle.tsx
var action7 = async ({ request, context }) => {
  let userId = await requireUserId(request), { postId } = await request.json();
  if (!postId)
    return json8({ error: "Missing postId" }, { status: 400 });
  let db = context.env.DB, result = await toggleBookmark(db, postId, userId);
  return json8(result);
};

// app/routes/api.integrity.report.tsx
var api_integrity_report_exports = {};
__export(api_integrity_report_exports, {
  action: () => action8
});
import { json as json9 } from "@remix-run/cloudflare";
import { z as z2 } from "zod";

// app/utils/integrity.server.ts
init_schema();
import { eq as eq10, and as and9, desc as desc5, isNull as isNull2 } from "drizzle-orm";
async function rateUser(db, user, ratingData) {
  try {
    if ((await db.select().from(userRatings).where(and9(
      eq10(userRatings.raterId, user.id),
      eq10(userRatings.ratedUserId, ratingData.ratedUserId),
      ratingData.referenceId ? eq10(userRatings.referenceId, ratingData.referenceId) : isNull2(userRatings.referenceId)
    )).limit(1)).length > 0)
      throw new Error("Already rated this user for this reference");
    await db.insert(userRatings).values({
      id: crypto.randomUUID(),
      raterId: user.id,
      ratedUserId: ratingData.ratedUserId,
      rating: ratingData.rating,
      reason: ratingData.reason,
      context: ratingData.context,
      referenceId: ratingData.referenceId || null,
      referenceType: ratingData.referenceType || null
    }), await db.insert(integrityHistory).values({
      id: crypto.randomUUID(),
      userId: ratingData.ratedUserId,
      action: "USER_RATED",
      points: ratingData.rating,
      description: `Rated by ${user.username}: ${ratingData.reason}`,
      referenceId: ratingData.referenceId || null,
      referenceType: ratingData.referenceType || null
    }), await updateUserIntegrityScore(db, ratingData.ratedUserId);
  } catch (error) {
    throw console.error("Error rating user:", error), error;
  }
}
async function reportViolation(db, user, violationData) {
  if (user.id === violationData.targetUserId)
    throw new Error("Cannot report yourself");
  try {
    if ((await db.select().from(integrityViolations).where(and9(
      eq10(integrityViolations.reporterId, user.id),
      eq10(integrityViolations.targetUserId, violationData.targetUserId),
      eq10(integrityViolations.violationType, violationData.violationType),
      violationData.referenceId ? eq10(integrityViolations.referenceId, violationData.referenceId) : isNull2(integrityViolations.referenceId)
    )).limit(1)).length > 0)
      throw new Error("You have already reported this user for this violation");
    let violation = await db.insert(integrityViolations).values({
      id: crypto.randomUUID(),
      reporterId: user.id,
      targetUserId: violationData.targetUserId,
      violationType: violationData.violationType,
      description: violationData.description,
      evidence: violationData.evidence,
      referenceId: violationData.referenceId,
      referenceType: violationData.referenceType
    }).returning({ id: integrityViolations.id });
    return await db.insert(integrityHistory).values({
      id: crypto.randomUUID(),
      userId: violationData.targetUserId,
      action: "VIOLATION_REPORTED",
      points: -5,
      // Negative points for being reported
      description: `Reported for ${violationData.violationType.toLowerCase()}`,
      referenceId: violation[0]?.id || null,
      referenceType: "VIOLATION"
    }), violation;
  } catch (error) {
    throw console.error("Error in reportViolation:", error), new Error("Failed to submit violation report. Please try again.");
  }
}
async function updateUserIntegrityScore(db, userId) {
  try {
    let ratings = await db.select({ rating: userRatings.rating }).from(userRatings).where(eq10(userRatings.ratedUserId, userId));
    if (ratings.length === 0)
      return;
    let averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await db.update(users).set({
      integrityScore: averageRating,
      totalRatings: ratings.length
    }).where(eq10(users.id, userId));
  } catch (error) {
    console.error("Error updating integrity score:", error);
  }
}

// app/routes/api.integrity.report.tsx
var ReportViolationSchema = z2.object({
  targetUserId: z2.string().min(1, "Target user ID is required"),
  violationType: z2.string().min(1, "Violation type is required"),
  description: z2.string().min(1, "Description is required").max(1e3, "Description must be less than 1000 characters"),
  evidence: z2.string().optional(),
  referenceId: z2.string().optional(),
  referenceType: z2.string().optional()
}), action8 = async ({ request, context }) => {
  if (request.method !== "POST")
    return json9({ error: "Method not allowed" }, { status: 405 });
  try {
    let db = createDb(context.env.DB), user = await getUser(request, db);
    if (!user)
      return json9({ error: "User not authenticated" }, { status: 401 });
    let formData = await request.formData(), data = {
      targetUserId: formData.get("targetUserId"),
      violationType: formData.get("violationType"),
      description: formData.get("description"),
      evidence: formData.get("evidence") || void 0,
      referenceId: formData.get("referenceId") || void 0,
      referenceType: formData.get("referenceType") || void 0
    }, validatedData = ReportViolationSchema.parse(data), violation = await reportViolation(db, user, validatedData);
    return json9({
      success: !0,
      violation,
      message: "Violation reported successfully"
    });
  } catch (error) {
    return error instanceof z2.ZodError ? json9({
      error: "Validation error",
      details: error.errors
    }, { status: 400 }) : error instanceof Error ? json9({
      error: error.message
    }, { status: 400 }) : json9({
      error: "An unexpected error occurred"
    }, { status: 500 });
  }
};

// app/routes/api.profile.picture.tsx
var api_profile_picture_exports = {};
__export(api_profile_picture_exports, {
  action: () => action9
});
import { json as json10 } from "@remix-run/cloudflare";

// app/utils/cloudinary.server.ts
async function uploadToCloudinary(base64Data, options) {
  try {
    let base64String = base64Data.split(",")[1], cloudName = process.env.CLOUDINARY_CLOUD_NAME, apiKey = process.env.CLOUDINARY_API_KEY, apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret)
      throw new Error("Cloudinary configuration missing");
    let formData = new FormData();
    formData.append("file", `data:${options.resourceType}/${options.resourceType === "video" ? "mp4" : "jpeg"};base64,${base64String}`), formData.append("resource_type", options.resourceType), formData.append("folder", options.folder || "portal"), options.publicId && formData.append("public_id", options.publicId), formData.append("overwrite", "true");
    let timestamp = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3), signature = await generateSignature({
      timestamp,
      folder: options.folder || "portal",
      overwrite: "true",
      resourceType: options.resourceType,
      apiSecret
    });
    formData.append("timestamp", timestamp.toString()), formData.append("signature", signature);
    let response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType}/upload`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      let errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    throw console.error("Cloudinary upload error:", error), new Error("Failed to upload media");
  }
}
async function generateSignature(params) {
  let stringToSign = "";
  params.publicId && (stringToSign += `public_id=${params.publicId}&`), params.folder && (stringToSign += `folder=${params.folder}&`), params.overwrite && (stringToSign += `overwrite=${params.overwrite}&`), params.resourceType && (stringToSign += `resource_type=${params.resourceType}&`), stringToSign += `timestamp=${params.timestamp}`;
  let data = new TextEncoder().encode(stringToSign + params.apiSecret), hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// app/routes/api.profile.picture.tsx
init_schema();
import { eq as eq11 } from "drizzle-orm";
async function action9({ request, context }) {
  try {
    let db = createDb(context.env.DB), user = await getUser(request, db);
    if (!user)
      return json10({ error: "You must be logged in to perform this action" }, { status: 401 });
    let file = (await request.formData()).get("profilePicture");
    if (!file)
      return json10({ error: "No file provided" }, { status: 400 });
    let arrayBuffer = await file.arrayBuffer(), base64 = Buffer.from(arrayBuffer).toString("base64"), dataUrl = `data:${file.type};base64,${base64}`, uploadResult = await uploadToCloudinary(dataUrl, {
      resourceType: "image",
      folder: "profile-pictures"
    });
    if (!uploadResult.secure_url)
      throw new Error("Failed to upload image");
    return await db.update(profiles).set({ profilePicture: uploadResult.secure_url }).where(eq11(profiles.userId, user.id)).run(), json10({
      success: !0,
      profilePicture: uploadResult.secure_url
    });
  } catch (error) {
    return json10({
      error: "Failed to upload profile picture",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// app/routes/api.refund.requests.tsx
var api_refund_requests_exports = {};
__export(api_refund_requests_exports, {
  loader: () => loader3
});
import { json as json11 } from "@remix-run/cloudflare";
init_schema();
import { eq as eq12 } from "drizzle-orm";
async function loader3({ request, context }) {
  let db = createDb(context.env.DB), user = await getUser(request, db);
  if (!user)
    return json11({ error: "Unauthorized" }, { status: 401 });
  try {
    let userRefundRequests = await db.query.refundRequests.findMany({
      where: eq12(refundRequests.requesterId, user.id),
      orderBy: [refundRequests.createdAt]
    });
    return json11({ refundRequests: userRefundRequests });
  } catch {
    return json11({ error: "Failed to fetch refund requests" }, { status: 500 });
  }
}

// app/routes/api.wallet.withdraw.tsx
var api_wallet_withdraw_exports = {};
__export(api_wallet_withdraw_exports, {
  action: () => action10
});
import { json as json12 } from "@remix-run/cloudflare";
init_virtual_wallet_server();
import { z as z3 } from "zod";
var withdrawSchema = z3.object({
  amount: z3.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0, {
    message: "Amount must be a positive number"
  }),
  solanaAddress: z3.string().min(1, "Solana address is required")
});
async function action10({ request, context }) {
  try {
    let userId = await requireUserId(request), formData = await request.formData(), validation = withdrawSchema.safeParse({
      amount: formData.get("amount"),
      solanaAddress: formData.get("solanaAddress")
    });
    if (!validation.success)
      return json12({ error: validation.error.errors[0].message }, { status: 400 });
    let { amount, solanaAddress } = validation.data, db = createDb(context.env.DB), wallet = await getVirtualWallet(db, userId);
    if (wallet || (wallet = await createVirtualWallet(db, userId)), !wallet)
      return json12({ error: "Failed to create wallet" }, { status: 500 });
    if (wallet.balance < amount)
      return json12({ error: "Insufficient balance" }, { status: 400 });
    let transaction = await createWithdrawalRequest(db, userId, amount, {
      solanaAddress,
      type: "withdrawal"
    });
    return json12({
      success: !0,
      transaction,
      message: `Withdrawal request created for ${amount} tokens`
    });
  } catch (error) {
    return console.error("Withdrawal error:", error), json12({ error: "Failed to process withdrawal" }, { status: 500 });
  }
}

// app/routes/api.integrity.rate.tsx
var api_integrity_rate_exports = {};
__export(api_integrity_rate_exports, {
  action: () => action11
});
import { json as json13 } from "@remix-run/cloudflare";
import { z as z4 } from "zod";
var RateUserSchema = z4.object({
  ratedUserId: z4.string().min(1, "User ID is required"),
  rating: z4.number().min(1).max(10, "Rating must be between 1 and 10"),
  reason: z4.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters"),
  context: z4.string().min(1, "Context is required"),
  referenceId: z4.string().optional(),
  referenceType: z4.string().optional()
}), action11 = async ({ request, context }) => {
  if (request.method !== "POST")
    return json13({ error: "Method not allowed" }, { status: 405 });
  try {
    let db = createDb(context.env.DB), user = await getUser(request, db);
    if (!user)
      return json13({ error: "User not authenticated" }, { status: 401 });
    let formData = await request.formData(), data = {
      ratedUserId: formData.get("ratedUserId"),
      rating: parseInt(formData.get("rating")),
      reason: formData.get("reason"),
      context: formData.get("context"),
      referenceId: formData.get("referenceId") || void 0,
      referenceType: formData.get("referenceType") || void 0
    }, validatedData = RateUserSchema.parse(data);
    return await rateUser(db, user, validatedData), json13({
      success: !0,
      message: "User rated successfully"
    });
  } catch (error) {
    return console.error("Error processing integrity rating:", error), json13({ error: "Failed to process rating" }, { status: 500 });
  }
};

// app/routes/api.refund.request.tsx
var api_refund_request_exports = {};
__export(api_refund_request_exports, {
  action: () => action12
});
import { json as json14 } from "@remix-run/cloudflare";

// app/utils/refund-system.server.ts
init_virtual_wallet_server();
init_schema();
import { eq as eq13, and as and10, desc as desc6, sql as sql6 } from "drizzle-orm";
async function createRefundRequest(db, bountyId, requesterId, reason) {
  try {
    let bounty = await db.query.bounties.findFirst({
      where: eq13(bounties.id, bountyId)
    });
    if (!bounty)
      throw new Error("Bounty not found");
    if (bounty.status !== "ACTIVE")
      throw new Error("Bounty is not active");
    if (await db.query.refundRequests.findFirst({
      where: and10(
        eq13(refundRequests.bountyId, bountyId),
        eq13(refundRequests.requesterId, requesterId),
        eq13(refundRequests.status, "PENDING")
      )
    }))
      throw new Error("Refund request already exists for this bounty");
    let expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3), [refundRequest] = await db.insert(refundRequests).values({
      id: crypto.randomUUID(),
      bountyId,
      requesterId,
      reason,
      status: "PENDING",
      communityVotes: 0,
      requiredVotes: 5,
      expiresAt
    }).returning().all();
    return refundRequest;
  } catch (error) {
    throw console.error("Error creating refund request:", error), error;
  }
}
async function voteOnRefundRequest(db, refundRequestId, voterId, vote, reason) {
  try {
    let refundRequest = await db.query.refundRequests.findFirst({
      where: eq13(refundRequests.id, refundRequestId)
    });
    if (!refundRequest)
      throw new Error("Refund request not found");
    if (refundRequest.status !== "PENDING")
      throw new Error("Refund request is not pending");
    if (refundRequest.requesterId === voterId)
      throw new Error("Cannot vote on your own refund request");
    if (await db.query.refundRequestVotes.findFirst({
      where: and10(
        eq13(refundRequestVotes.refundRequestId, refundRequestId),
        eq13(refundRequestVotes.voterId, voterId)
      )
    }))
      throw new Error("Already voted on this refund request");
    let rewardAmount = 0.1, [voteRecord] = await db.insert(refundRequestVotes).values({
      id: crypto.randomUUID(),
      refundRequestId,
      voterId,
      vote,
      reason: reason || void 0,
      rewardAmount
    }).returning().all(), voteCount = (await db.select({ count: sql6`count(*)` }).from(refundRequestVotes).where(eq13(refundRequestVotes.refundRequestId, refundRequestId)).get())?.count || 0;
    await db.update(refundRequests).set({ communityVotes: voteCount }).where(eq13(refundRequests.id, refundRequestId)).run(), await addCompensation(db, voterId, rewardAmount, "Voting on refund request");
    let approvalCount = (await db.select({ count: sql6`count(*)` }).from(refundRequestVotes).where(and10(
      eq13(refundRequestVotes.refundRequestId, refundRequestId),
      eq13(refundRequestVotes.vote, !0)
    )).get())?.count || 0, rejectionCount = voteCount - approvalCount;
    return approvalCount >= refundRequest.requiredVotes ? await approveRefundRequest(db, refundRequestId) : rejectionCount >= refundRequest.requiredVotes && await rejectRefundRequest(db, refundRequestId), voteRecord;
  } catch (error) {
    throw console.error("Error voting on refund request:", error), error;
  }
}
async function approveRefundRequest(db, refundRequestId) {
  try {
    let refundRequest = await db.query.refundRequests.findFirst({
      where: eq13(refundRequests.id, refundRequestId)
    });
    if (!refundRequest)
      throw new Error("Refund request not found");
    let bounty = await db.query.bounties.findFirst({
      where: eq13(bounties.id, refundRequest.bountyId)
    });
    if (!bounty)
      throw new Error("Bounty not found");
    let refundAmount = bounty.amount * (1 - bounty.refundPenalty);
    await refundBounty(db, refundRequest.requesterId, refundAmount, bounty.id), await db.update(refundRequests).set({ status: "APPROVED" }).where(eq13(refundRequests.id, refundRequestId)).run();
    let correctVotes = await db.query.refundRequestVotes.findMany({
      where: and10(
        eq13(refundRequestVotes.refundRequestId, refundRequestId),
        eq13(refundRequestVotes.vote, !0)
      )
    });
    for (let vote of correctVotes)
      await addCompensation(
        db,
        vote.voterId,
        vote.rewardAmount * 2,
        // Double reward for correct vote
        "Correctly voted to approve refund request"
      );
  } catch (error) {
    throw console.error("Error approving refund request:", error), error;
  }
}
async function rejectRefundRequest(db, refundRequestId) {
  try {
    await db.update(refundRequests).set({ status: "REJECTED" }).where(eq13(refundRequests.id, refundRequestId)).run();
    let correctVotes = await db.query.refundRequestVotes.findMany({
      where: and10(
        eq13(refundRequestVotes.refundRequestId, refundRequestId),
        eq13(refundRequestVotes.vote, !1)
      )
    });
    for (let vote of correctVotes)
      await addCompensation(
        db,
        vote.voterId,
        vote.rewardAmount * 2,
        // Double reward for correct vote
        "Correctly voted to reject refund request"
      );
  } catch (error) {
    throw console.error("Error rejecting refund request:", error), error;
  }
}

// app/routes/api.refund.request.tsx
import { z as z5 } from "zod";
var schema2 = z5.object({
  bountyId: z5.string(),
  reason: z5.string().min(5)
});
async function action12({ request, context }) {
  let db = createDb(context.env.DB), user = await getUser(request, db);
  if (!user)
    return json14({ error: "Unauthorized" }, { status: 401 });
  let form = await request.formData(), bountyId = form.get("bountyId"), reason = form.get("reason"), parseResult = schema2.safeParse({ bountyId, reason });
  if (!parseResult.success)
    return json14({ error: "Invalid input", details: parseResult.error.flatten() }, { status: 400 });
  try {
    let refundRequest = await createRefundRequest(db, bountyId, user.id, reason);
    return json14({ success: !0, refundRequest });
  } catch (error) {
    return json14({ error: error instanceof Error ? error.message : "Failed to create refund request" }, { status: 500 });
  }
}

// app/routes/api.wallet.deposit.tsx
var api_wallet_deposit_exports = {};
__export(api_wallet_deposit_exports, {
  action: () => action13
});
init_virtual_wallet_server();
init_bounty_bucks_info();
init_virtual_wallet_server();
import { json as json15 } from "@remix-run/cloudflare";
import { z as z6 } from "zod";
var TOKEN_SYMBOL2 = bounty_bucks_info_default.symbol, depositSchema = z6.object({
  amount: z6.number().positive().max(1e4),
  transactionId: z6.string().optional()
}), confirmDepositSchema2 = z6.object({
  transactionId: z6.string(),
  solanaSignature: z6.string()
});
async function action13({ request, context }) {
  let db = createDb(context.env.DB), user = await getUser(request, db);
  if (!user)
    return json15({ success: !1, error: "Unauthorized" }, { status: 401 });
  let form = await request.formData(), amount = parseFloat(form.get("amount"));
  if (form.get("action") === "confirm") {
    let transactionId = form.get("transactionId"), solanaSignature = form.get("solanaSignature");
    if (!solanaSignature)
      return json15({ success: !1, error: "Solana signature required" }, { status: 400 });
    try {
      let result = await confirmDeposit(db, transactionId, solanaSignature);
      return json15({ success: !0, transaction: result });
    } catch (error) {
      return json15({ success: !1, error: error instanceof Error ? error.message : "Failed to confirm deposit" }, { status: 400 });
    }
  }
  if (!amount || amount <= 0)
    return json15({ success: !1, error: "Invalid amount" }, { status: 400 });
  try {
    let result = await createDepositRequest(db, user.id, amount);
    return json15({ success: !0, transaction: result });
  } catch (error) {
    return json15({ success: !1, error: error instanceof Error ? error.message : "Failed to create deposit request" }, { status: 500 });
  }
}

// app/routes/default-avatar.png.tsx
var default_avatar_png_exports = {};
__export(default_avatar_png_exports, {
  loader: () => loader4
});
var loader4 = async () => {
  let svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="#4B5563"/>
      <path d="M20 20C22.21 20 24 18.21 24 16C24 13.79 22.21 12 20 12C17.79 12 16 13.79 16 16C16 18.21 17.79 20 20 20ZM20 22C17.33 22 12 23.34 12 26V28H28V26C28 23.34 22.67 22 20 22Z" fill="#9CA3AF"/>
    </svg>
  `;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000"
    }
  });
};

// app/routes/docs.refund-system.tsx
var docs_refund_system_exports = {};
__export(docs_refund_system_exports, {
  default: () => RefundSystemDocsPage,
  loader: () => loader5
});
import { json as json16 } from "@remix-run/node";
import { useLoaderData as useLoaderData2, Link as Link3 } from "@remix-run/react";

// app/components/nav.tsx
import { useEffect as useEffect4, useState as useState3 } from "react";
import { Link, Form } from "@remix-run/react";
import gsap from "gsap";
import { FiCreditCard, FiLogOut } from "react-icons/fi";

// app/components/ClientOnly.tsx
import { useEffect as useEffect3, useState as useState2 } from "react";
import { Fragment as Fragment2, jsx as jsx4 } from "react/jsx-runtime";
function ClientOnly({ children }) {
  let [mounted, setMounted] = useState2(!1);
  return useEffect3(() => {
    setMounted(!0);
  }, []), mounted ? /* @__PURE__ */ jsx4(Fragment2, { children }) : null;
}

// app/components/nav.tsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
function WalletButton() {
  let [mounted, setMounted] = useState3(!1), [walletHooks, setWalletHooks] = useState3(null);
  return useEffect4(() => {
    setMounted(!0), typeof window < "u" && Promise.all([
      import("@solana/wallet-adapter-react"),
      import("@solana/wallet-adapter-react-ui")
    ]).then(([walletModule, modalModule]) => {
      setWalletHooks({
        useWallet: walletModule.useWallet,
        useWalletModal: modalModule.useWalletModal
      });
    }).catch((error) => {
      console.error("Failed to load wallet hooks:", error);
    });
  }, []), !mounted || !walletHooks ? /* @__PURE__ */ jsxs2("button", { className: "w-full py-2 px-3 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-medium flex items-center justify-center gap-2", children: [
    /* @__PURE__ */ jsx5(FiCreditCard, { className: "w-4 h-4" }),
    /* @__PURE__ */ jsx5("span", { className: "hidden group-hover:block", children: "Connect Wallet" })
  ] }) : /* @__PURE__ */ jsx5(WalletButtonWithHooks, { walletHooks });
}
function WalletButtonWithHooks({ walletHooks }) {
  let { useWallet, useWalletModal } = walletHooks, { wallet, connected, disconnect } = useWallet(), { setVisible } = useWalletModal(), handleWalletClick = () => {
    connected ? disconnect() : setVisible(!0);
  }, formatAddress = (address) => `${address.slice(0, 4)}...${address.slice(-4)}`;
  return connected ? /* @__PURE__ */ jsxs2("div", { className: "group/wallet relative", children: [
    /* @__PURE__ */ jsxs2(
      "button",
      {
        onClick: handleWalletClick,
        className: "w-full py-2 px-3 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium transition-all duration-300 hover:bg-green-600/30 hover:border-green-500/50 flex items-center justify-center gap-2",
        children: [
          /* @__PURE__ */ jsx5(FiCreditCard, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx5("span", { className: "hidden group-hover:block", children: wallet?.adapter?.publicKey ? formatAddress(wallet.adapter.publicKey.toString()) : "Connected" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs2(
      "button",
      {
        onClick: () => disconnect(),
        className: "absolute inset-0 w-full py-2 px-3 bg-red-600/80 border border-red-500/80 rounded-lg text-red-400 text-xs font-medium transition-all duration-300 opacity-0 group-hover/wallet:opacity-100 flex items-center justify-center gap-2",
        children: [
          /* @__PURE__ */ jsx5(FiLogOut, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx5("span", { className: "hidden group-hover/wallet:block", children: "Disconnect" })
        ]
      }
    )
  ] }) : /* @__PURE__ */ jsxs2(
    "button",
    {
      onClick: handleWalletClick,
      className: "w-full py-2 px-3 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-medium transition-all duration-300 hover:bg-violet-600/30 hover:border-violet-500/50 flex items-center justify-center gap-2",
      children: [
        /* @__PURE__ */ jsx5(FiCreditCard, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsx5("span", { className: "hidden group-hover:block", children: "Connect Wallet" })
      ]
    }
  );
}
function Nav() {
  let [mounted, setMounted] = useState3(!1);
  useEffect4(() => {
    setMounted(!0);
  }, []);
  let bubbleConfigs = [
    { size: 4, opacity: 0.6, duration: 3.5, className: "bubble" },
    { size: 3, opacity: 0.6, duration: 4, className: "bubble-1" },
    { size: 2, opacity: 0.6, duration: 4.5, className: "bubble-2" }
  ];
  return useEffect4(() => {
    if (!mounted)
      return;
    let nav = document.querySelector(".nav-container");
    if (!nav)
      return;
    let navWidth = nav.clientWidth, navHeight = nav.clientHeight, container = document.querySelector(".bubble-container");
    if (!container)
      return;
    container.innerHTML = "";
    let createBubble = (config, index) => {
      let bubble = document.createElement("div");
      bubble.className = `${config.className}-${index} absolute rounded-full bg-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.6),0_0_15px_rgba(99,102,241,0.4)]`, bubble.style.width = `${config.size}px`, bubble.style.height = `${config.size}px`, bubble.style.opacity = config.opacity.toString(), bubble.style.left = `${Math.random() * 100}%`, bubble.style.top = "0%", container.appendChild(bubble), gsap.to(bubble, {
        y: navHeight,
        duration: config.duration + Math.random() * 2,
        ease: "none",
        onUpdate: function() {
          let progress = this.progress(), glowIntensity = 0.4 + Math.sin(progress * Math.PI * 2) * 0.3;
          bubble.style.boxShadow = `0 0 ${8 + glowIntensity * 8}px rgba(99,102,241,${0.4 + glowIntensity * 0.3}), 0 0 ${15 + glowIntensity * 15}px rgba(99,102,241,${0.3 + glowIntensity * 0.2})`;
        },
        onComplete: function() {
          bubble.remove(), createBubble(config, index);
        }
      });
    };
    return bubbleConfigs.forEach((config) => {
      for (let i = 0; i < 15; i++)
        createBubble(config, i);
    }), () => {
      gsap.killTweensOf(".bubble, .bubble-1, .bubble-2");
    };
  }, [mounted]), /* @__PURE__ */ jsxs2("div", { className: "group fixed left-0 top-0 h-screen w-20 bg-neutral-800 flex flex-col items-center transition-all duration-300 ease-in-out hover:w-64 overflow-hidden z-[9999] nav-container", children: [
    /* @__PURE__ */ jsx5("div", { className: "absolute inset-0 overflow-hidden bubble-container pointer-events-none" }),
    /* @__PURE__ */ jsxs2("div", { className: "relative z-10 flex flex-col items-center w-full py-5", children: [
      /* @__PURE__ */ jsx5("div", { className: "relative w-12 h-12 flex items-center justify-center", children: /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className: "w-10 h-10 text-gray-300 transition-all duration-500 group-hover:text-indigo-300 group-hover:scale-110", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ jsx5("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsx5("path", { d: "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" }),
        /* @__PURE__ */ jsx5("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
      ] }) }),
      /* @__PURE__ */ jsx5("h1", { className: "text-gray-300 text-xs font-bold tracking-wider font-cursive transition-all duration-500 group-hover:text-indigo-300 group-hover:text-lg mt-2", children: "portal.ask" })
    ] }),
    /* @__PURE__ */ jsx5("hr", { className: "border-b border-gray-500 w-4/6 relative z-10" }),
    /* @__PURE__ */ jsxs2("div", { className: "relative z-10 flex flex-col items-center w-full flex-1 justify-center", children: [
      /* @__PURE__ */ jsx5(Link, { to: "/profile", className: "w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5", children: /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center gap-4 px-4 py-1", children: [
        /* @__PURE__ */ jsx5("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
        /* @__PURE__ */ jsx5("span", { className: "hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block", children: "Profile" })
      ] }) }),
      /* @__PURE__ */ jsx5("hr", { className: "border-b border-gray-500 w-4/6" }),
      /* @__PURE__ */ jsx5(Link, { to: "/community", className: "w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5", children: /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center gap-4 px-4 py-1", children: [
        /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110", viewBox: "0 0 20 20", fill: "currentColor", children: [
          /* @__PURE__ */ jsx5("path", { d: "M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" }),
          /* @__PURE__ */ jsx5("path", { d: "M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" })
        ] }),
        /* @__PURE__ */ jsx5("span", { className: "hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block", children: "Community" })
      ] }) }),
      /* @__PURE__ */ jsx5("hr", { className: "border-b border-gray-500 w-4/6" }),
      /* @__PURE__ */ jsx5(Link, { to: "/refund-requests", className: "w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5", children: /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center gap-4 px-4 py-1", children: [
        /* @__PURE__ */ jsx5("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-yellow-300 group-hover:scale-110", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsx5("span", { className: "hidden text-sm font-medium text-gray-300 group-hover:text-yellow-300 group-hover:block", children: "Refund Requests" })
      ] }) }),
      /* @__PURE__ */ jsx5("hr", { className: "border-b border-gray-500 w-4/6" }),
      /* @__PURE__ */ jsx5(Link, { to: "/wallet", className: "w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5", children: /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center gap-4 px-4 py-1", children: [
        /* @__PURE__ */ jsx5("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }),
        /* @__PURE__ */ jsx5("span", { className: "hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block", children: "Wallet" })
      ] }) }),
      /* @__PURE__ */ jsx5("hr", { className: "border-b border-gray-500 w-4/6" }),
      /* @__PURE__ */ jsx5(Link, { to: "/settings", className: "w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5", children: /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center gap-4 px-4 py-1", children: [
        /* @__PURE__ */ jsxs2("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
          /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
          /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
        ] }),
        /* @__PURE__ */ jsx5("span", { className: "hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block", children: "Settings" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "relative z-10 mt-auto w-full", children: [
      /* @__PURE__ */ jsx5("hr", { className: "border-b border-gray-500 w-4/6 mx-auto mb-4" }),
      /* @__PURE__ */ jsx5("div", { className: "w-full px-4 mb-4", children: /* @__PURE__ */ jsx5(ClientOnly, { children: /* @__PURE__ */ jsx5(WalletButton, {}) }) }),
      /* @__PURE__ */ jsx5(Form, { method: "post", action: "/logout", className: "w-full", children: /* @__PURE__ */ jsx5("button", { type: "submit", className: "w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5", children: /* @__PURE__ */ jsxs2("div", { className: "relative flex items-center gap-4 px-4 py-1", children: [
        /* @__PURE__ */ jsx5("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }),
        /* @__PURE__ */ jsx5("span", { className: "hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block", children: "Logout" })
      ] }) }) })
    ] })
  ] });
}

// app/components/Footer.tsx
import { Link as Link2 } from "@remix-run/react";
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function Footer() {
  let currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsx6("footer", { className: "bg-neutral-800/80 border-t border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]", children: /* @__PURE__ */ jsxs3("div", { className: "max-w-8xl mx-auto px-4 py-8 ml-24", children: [
    /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs3("div", { className: "col-span-1 md:col-span-2", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center space-x-2 mb-4", children: [
          /* @__PURE__ */ jsxs3(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "w-8 h-8 text-violet-400",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: [
                /* @__PURE__ */ jsx6("circle", { cx: "12", cy: "12", r: "10" }),
                /* @__PURE__ */ jsx6("path", { d: "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" }),
                /* @__PURE__ */ jsx6("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
              ]
            }
          ),
          /* @__PURE__ */ jsx6("h3", { className: "text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-600", children: "portal.ask" })
        ] }),
        /* @__PURE__ */ jsx6("p", { className: "text-gray-400 text-sm leading-relaxed max-w-md", children: "A decentralized platform for knowledge sharing, community building, and reputation-based interactions. Join our community to ask questions, share insights, and earn rewards." }),
        /* @__PURE__ */ jsxs3("div", { className: "flex space-x-4 mt-4", children: [
          /* @__PURE__ */ jsx6(
            "a",
            {
              href: "https://x.com/portal_ask",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-gray-400 hover:text-violet-400 transition-colors",
              children: /* @__PURE__ */ jsx6("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx6("path", { d: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" }) })
            }
          ),
          /* @__PURE__ */ jsx6(
            "a",
            {
              href: "https://discord.gg/zvB9gwhq",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-gray-400 hover:text-violet-400 transition-colors",
              children: /* @__PURE__ */ jsx6("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx6("path", { d: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" }) })
            }
          ),
          /* @__PURE__ */ jsx6(
            "a",
            {
              href: "https://github.com/portal",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-gray-400 hover:text-violet-400 transition-colors",
              children: /* @__PURE__ */ jsx6("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx6("path", { d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" }) })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx6("h4", { className: "text-violet-300 font-semibold mb-4", children: "Quick Links" }),
        /* @__PURE__ */ jsxs3("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(Link2, { to: "/community", className: "text-gray-400 hover:text-violet-400 transition-colors text-sm", children: "Community" }) }),
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(Link2, { to: "/posts/create", className: "text-gray-400 hover:text-violet-400 transition-colors text-sm", children: "Create Post" }) }),
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(Link2, { to: "/wallet", className: "text-gray-400 hover:text-violet-400 transition-colors text-sm", children: "Wallet" }) }),
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(Link2, { to: "/transactions", className: "text-gray-400 hover:text-violet-400 transition-colors text-sm", children: "Transactions" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx6("h4", { className: "text-violet-300 font-semibold mb-4", children: "Support" }),
        /* @__PURE__ */ jsxs3("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(
            "a",
            {
              href: "mailto:bountybucks524@gmail.com",
              className: "text-gray-400 hover:text-violet-400 transition-colors text-sm",
              children: "Contact Support"
            }
          ) }),
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(
            "a",
            {
              href: "/docs",
              className: "text-gray-400 hover:text-violet-400 transition-colors text-sm",
              children: "Documentation"
            }
          ) }),
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(
            "a",
            {
              href: "/privacy",
              className: "text-gray-400 hover:text-violet-400 transition-colors text-sm",
              children: "Privacy Policy"
            }
          ) }),
          /* @__PURE__ */ jsx6("li", { children: /* @__PURE__ */ jsx6(
            "a",
            {
              href: "/terms",
              className: "text-gray-400 hover:text-violet-400 transition-colors text-sm",
              children: "Terms of Service"
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "border-t border-violet-500/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center", children: [
      /* @__PURE__ */ jsxs3("p", { className: "text-gray-500 text-sm", children: [
        "\xA9 ",
        currentYear,
        " portal.ask. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center space-x-4 mt-4 md:mt-0", children: [
        /* @__PURE__ */ jsx6("span", { className: "text-gray-500 text-sm", children: "Powered by" }),
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx6("svg", { className: "w-5 h-5 text-violet-400", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx6("path", { d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" }) }),
          /* @__PURE__ */ jsx6("span", { className: "text-violet-400 text-sm font-medium", children: "Solana" })
        ] })
      ] })
    ] })
  ] }) });
}

// app/components/Layout.tsx
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
function Layout({ children, showNav = !0 }) {
  return /* @__PURE__ */ jsxs4("div", { className: "min-h-screen w-full bg-neutral-900/95 flex flex-row", children: [
    showNav && /* @__PURE__ */ jsx7(Nav, {}),
    /* @__PURE__ */ jsxs4("div", { className: "flex-1 flex flex-col ml-20", children: [
      /* @__PURE__ */ jsx7("main", { className: "flex-1 overflow-y-auto", children }),
      /* @__PURE__ */ jsx7(Footer, {})
    ] })
  ] });
}

// app/routes/docs.refund-system.tsx
import { FiArrowLeft, FiExternalLink, FiClock, FiUsers, FiShield, FiAward, FiAlertTriangle } from "react-icons/fi";
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
var loader5 = async () => json16({
  title: "Refund System Documentation",
  description: "Understanding the refund system and dispute resolution"
});
function RefundSystemDocsPage() {
  let data = useLoaderData2(), { title, description } = data;
  return /* @__PURE__ */ jsx8(Layout, { children: /* @__PURE__ */ jsxs5("div", { className: "w-auto max-w-6xl mx-auto mt-4 px-4 ml-24 pb-16", children: [
    /* @__PURE__ */ jsxs5("div", { className: "mb-8 mt-16", children: [
      /* @__PURE__ */ jsxs5(
        Link3,
        {
          to: "/docs",
          className: "inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors mb-4",
          children: [
            /* @__PURE__ */ jsx8(FiArrowLeft, { className: "w-4 h-4 mr-2" }),
            "Back to Documentation"
          ]
        }
      ),
      /* @__PURE__ */ jsx8("h1", { className: "text-4xl font-bold text-white mb-4", children: title }),
      /* @__PURE__ */ jsx8("p", { className: "text-gray-400 text-lg max-w-3xl", children: description })
    ] }),
    /* @__PURE__ */ jsx8("div", { className: "prose prose-invert prose-violet max-w-none", children: /* @__PURE__ */ jsxs5("div", { className: "bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8", children: [
      /* @__PURE__ */ jsx8("h2", { children: "Overview" }),
      /* @__PURE__ */ jsx8("p", { children: "The refund system in portal.ask is designed to prevent abuse while ensuring fair treatment for all users. It combines time-based restrictions with community governance to create a balanced and transparent process for handling bounty refunds." }),
      /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 my-8", children: [
        /* @__PURE__ */ jsxs5("div", { className: "bg-violet-500/10 p-6 rounded-lg border border-violet-500/30", children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center mb-3", children: [
            /* @__PURE__ */ jsx8(FiClock, { className: "w-6 h-6 text-violet-400 mr-3" }),
            /* @__PURE__ */ jsx8("h3", { className: "text-violet-300 font-semibold", children: "Time-Based Restrictions" })
          ] }),
          /* @__PURE__ */ jsx8("p", { className: "text-gray-300 text-sm", children: "Users must wait 24 hours after receiving the first answer before requesting a refund. This prevents users from getting free help and then immediately refunding." })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "bg-green-500/10 p-6 rounded-lg border border-green-500/30", children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center mb-3", children: [
            /* @__PURE__ */ jsx8(FiUsers, { className: "w-6 h-6 text-green-400 mr-3" }),
            /* @__PURE__ */ jsx8("h3", { className: "text-green-300 font-semibold", children: "Community Governance" })
          ] }),
          /* @__PURE__ */ jsx8("p", { className: "text-gray-300 text-sm", children: "All refund requests require community approval through voting. Community members earn rewards for participating in governance decisions." })
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h2", { children: "How the Refund System Works" }),
      /* @__PURE__ */ jsx8("h3", { children: "1. Creating a Refund Request" }),
      /* @__PURE__ */ jsxs5("div", { className: "bg-neutral-700/40 p-6 rounded-lg mb-6", children: [
        /* @__PURE__ */ jsx8("h4", { children: "Prerequisites" }),
        /* @__PURE__ */ jsxs5("ul", { children: [
          /* @__PURE__ */ jsx8("li", { children: "You must be the original bounty creator" }),
          /* @__PURE__ */ jsx8("li", { children: "Bounty must be in ACTIVE status" }),
          /* @__PURE__ */ jsx8("li", { children: "24 hours must have passed since the first answer (if any answers exist)" }),
          /* @__PURE__ */ jsx8("li", { children: "No existing refund request for this bounty" })
        ] }),
        /* @__PURE__ */ jsx8("h4", { children: "Process" }),
        /* @__PURE__ */ jsxs5("ol", { children: [
          /* @__PURE__ */ jsx8("li", { children: "Navigate to your bounty post" }),
          /* @__PURE__ */ jsx8("li", { children: 'Click "Request Refund" button' }),
          /* @__PURE__ */ jsx8("li", { children: "Provide a detailed reason (minimum 10 characters)" }),
          /* @__PURE__ */ jsx8("li", { children: "Submit the request" })
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h2", { children: "Community Voting Process" }),
      /* @__PURE__ */ jsxs5("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-lg font-semibold text-white mb-3", children: "Community Voting Process" }),
        /* @__PURE__ */ jsxs5("div", { className: "bg-neutral-800 rounded-lg p-4 border border-neutral-700", children: [
          /* @__PURE__ */ jsx8("p", { className: "text-gray-300 mb-3", children: "Refund requests are decided by community vote to ensure fairness and prevent abuse." }),
          /* @__PURE__ */ jsxs5("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx8("h4", { className: "text-white font-medium mb-2", children: "Voting Requirements" }),
            /* @__PURE__ */ jsxs5("ul", { className: "text-gray-300 text-sm space-y-1", children: [
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "50+ reputation points" }),
                " and ",
                /* @__PURE__ */ jsx8("strong", { children: "7+ days account age" })
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 Must have ",
                /* @__PURE__ */ jsx8("strong", { children: "previously engaged" }),
                " with the post (voted on post/answers)"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Minimum 20 characters" }),
                " of reasoning required for each vote"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "5-minute minimum review time" }),
                " after refund request creation"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Maximum 10 votes per 24 hours" }),
                " to prevent spam"
              ] }),
              /* @__PURE__ */ jsx8("li", { children: "\u2022 Cannot vote on your own refund request" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs5("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx8("h4", { className: "text-white font-medium mb-2", children: "Voting Process" }),
            /* @__PURE__ */ jsxs5("ol", { className: "text-gray-300 text-sm space-y-2", children: [
              /* @__PURE__ */ jsxs5("li", { children: [
                /* @__PURE__ */ jsx8("strong", { children: "Review:" }),
                " Read the refund reason and examine the post/answers"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                /* @__PURE__ */ jsx8("strong", { children: "Vote:" }),
                " Choose approve or reject with detailed reasoning"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                /* @__PURE__ */ jsx8("strong", { children: "Wait:" }),
                " Decision made when minimum votes reached or time expires"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                /* @__PURE__ */ jsx8("strong", { children: "Reward:" }),
                " Tokens distributed when final decision is reached"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs5("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx8("h4", { className: "text-white font-medium mb-2", children: "Anti-Gaming Measures" }),
            /* @__PURE__ */ jsx8("p", { className: "text-gray-300 text-sm mb-2", children: "To prevent dishonest voting and ensure quality decisions:" }),
            /* @__PURE__ */ jsxs5("ul", { className: "text-gray-300 text-sm space-y-1", children: [
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Reputation thresholds" }),
                " ensure only established users vote"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Engagement requirements" }),
                " ensure voters understand the context"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Mandatory reasoning" }),
                " forces thoughtful consideration"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Time delays" }),
                " prevent impulsive voting"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Rate limiting" }),
                " prevents vote farming"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Delayed rewards" }),
                " align incentives with quality decisions"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs5("div", { children: [
            /* @__PURE__ */ jsx8("h4", { className: "text-white font-medium mb-2", children: "Decision Criteria" }),
            /* @__PURE__ */ jsxs5("ul", { className: "text-gray-300 text-sm space-y-1", children: [
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Approved:" }),
                " 60%+ positive votes with minimum vote count"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Rejected:" }),
                " Less than 60% positive votes"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Expired:" }),
                " Not enough votes within 48 hours"
              ] }),
              /* @__PURE__ */ jsxs5("li", { children: [
                "\u2022 ",
                /* @__PURE__ */ jsx8("strong", { children: "Required votes:" }),
                " 3 (no answers) or 7 (with answers)"
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "3. Reward Distribution" }),
      /* @__PURE__ */ jsxs5("div", { className: "bg-yellow-500/10 p-6 rounded-lg mb-6 border border-yellow-500/30", children: [
        /* @__PURE__ */ jsx8("h4", { children: "Governance Rewards" }),
        /* @__PURE__ */ jsxs5("ul", { children: [
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Token Rewards" }),
            ": 5% of bounty amount distributed among voters when final decision is reached"
          ] }),
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Reputation Points" }),
            ": +5 points for each governance participation (awarded immediately)"
          ] }),
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Distribution" }),
            ": Equal share among all voters who participated"
          ] }),
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Timing" }),
            ": Rewards are paid when refund request is approved, rejected, or expires"
          ] }),
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Example" }),
            ": 1 SOL bounty with 5 voters = 0.01 SOL per voter (paid at decision time)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "4. Refund Processing" }),
      /* @__PURE__ */ jsxs5("div", { className: "bg-neutral-700/40 p-6 rounded-lg mb-6", children: [
        /* @__PURE__ */ jsx8("h4", { children: "If Approved" }),
        /* @__PURE__ */ jsxs5("ul", { children: [
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Base Refund" }),
            ": Full bounty amount minus penalties"
          ] }),
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Penalty Calculation" }),
            ": 20% penalty if helpful answers exist (2+ votes)"
          ] }),
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Penalty Distribution" }),
            ": Penalty amount distributed to helpful answer authors"
          ] }),
          /* @__PURE__ */ jsxs5("li", { children: [
            /* @__PURE__ */ jsx8("strong", { children: "Integrity Impact" }),
            ": -1.0 integrity score if refunding with helpful answers"
          ] })
        ] }),
        /* @__PURE__ */ jsx8("h4", { children: "If Rejected" }),
        /* @__PURE__ */ jsxs5("ul", { children: [
          /* @__PURE__ */ jsx8("li", { children: "Bounty remains active for claiming" }),
          /* @__PURE__ */ jsx8("li", { children: "No refund is processed" }),
          /* @__PURE__ */ jsx8("li", { children: "Original bounty creator can still accept answers" })
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h2", { children: "Anti-Abuse Measures" }),
      /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 my-8", children: [
        /* @__PURE__ */ jsxs5("div", { className: "bg-red-500/10 p-6 rounded-lg border border-red-500/30", children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center mb-3", children: [
            /* @__PURE__ */ jsx8(FiAlertTriangle, { className: "w-6 h-6 text-red-400 mr-3" }),
            /* @__PURE__ */ jsx8("h3", { className: "text-red-300 font-semibold", children: "Time Lock" })
          ] }),
          /* @__PURE__ */ jsx8("p", { className: "text-gray-300 text-sm", children: "24-hour waiting period prevents users from getting free help and immediately refunding." })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "bg-orange-500/10 p-6 rounded-lg border border-orange-500/30", children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center mb-3", children: [
            /* @__PURE__ */ jsx8(FiShield, { className: "w-6 h-6 text-orange-400 mr-3" }),
            /* @__PURE__ */ jsx8("h3", { className: "text-orange-300 font-semibold", children: "Penalty System" })
          ] }),
          /* @__PURE__ */ jsx8("p", { className: "text-gray-300 text-sm", children: "20% penalty for refunding with helpful answers, distributed to answer authors." })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "bg-blue-500/10 p-6 rounded-lg border border-blue-500/30", children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex items-center mb-3", children: [
            /* @__PURE__ */ jsx8(FiAward, { className: "w-6 h-6 text-blue-400 mr-3" }),
            /* @__PURE__ */ jsx8("h3", { className: "text-blue-300 font-semibold", children: "Integrity Impact" })
          ] }),
          /* @__PURE__ */ jsx8("p", { className: "text-gray-300 text-sm", children: "Refunding with helpful answers reduces your integrity score, affecting community trust." })
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h2", { children: "Best Practices" }),
      /* @__PURE__ */ jsx8("h3", { children: "For Bounty Creators" }),
      /* @__PURE__ */ jsxs5("ul", { children: [
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Be Specific" }),
          ": Provide clear, detailed questions to get better answers"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Set Appropriate Bounties" }),
          ": Offer fair rewards for the complexity of your question"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Engage with Answers" }),
          ": Provide feedback and ask follow-up questions"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Only Refund When Necessary" }),
          ": Use refunds for legitimate reasons, not to avoid payment"
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "For Community Voters" }),
      /* @__PURE__ */ jsxs5("ul", { children: [
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Review Thoroughly" }),
          ": Examine the bounty, answers, and refund reason carefully"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Consider Context" }),
          ": Look at the quality and helpfulness of existing answers"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Vote Fairly" }),
          ": Base your vote on the merits, not personal bias"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Provide Reasoning" }),
          ": Explain your vote to help others understand your perspective"
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "For Answer Authors" }),
      /* @__PURE__ */ jsxs5("ul", { children: [
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Provide Quality Answers" }),
          ": Give detailed, helpful responses to earn votes"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Engage with the Community" }),
          ": Vote on other content to build reputation"
        ] }),
        /* @__PURE__ */ jsxs5("li", { children: [
          /* @__PURE__ */ jsx8("strong", { children: "Understand the System" }),
          ": Know that helpful answers are protected from unfair refunds"
        ] })
      ] }),
      /* @__PURE__ */ jsx8("h2", { children: "Frequently Asked Questions" }),
      /* @__PURE__ */ jsx8("h3", { children: "Q: Can I refund a bounty immediately if no one has answered?" }),
      /* @__PURE__ */ jsxs5("p", { children: [
        /* @__PURE__ */ jsx8("strong", { children: "A:" }),
        " Yes! If no answers have been provided, you can request a refund immediately without waiting for the 24-hour period."
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "Q: What happens if my refund request expires without enough votes?" }),
      /* @__PURE__ */ jsxs5("p", { children: [
        /* @__PURE__ */ jsx8("strong", { children: "A:" }),
        ' If the 48-hour voting period expires without reaching the minimum vote threshold, the request is marked as "EXPIRED" and no refund is processed. The bounty remains active.'
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "Q: How are governance rewards calculated?" }),
      /* @__PURE__ */ jsxs5("p", { children: [
        /* @__PURE__ */ jsx8("strong", { children: "A:" }),
        " The 5% governance fee is divided equally among all voters when the final decision is reached. For example, if a 1 SOL bounty has 5 voters, each voter receives 0.01 SOL (0.05 \xF7 5) when the refund request is approved, rejected, or expires."
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "Q: When do I receive my governance rewards?" }),
      /* @__PURE__ */ jsxs5("p", { children: [
        /* @__PURE__ */ jsx8("strong", { children: "A:" }),
        " Governance rewards are paid when the refund request reaches a final decision (approved, rejected, or expired). Reputation points are awarded immediately when you vote, but token rewards are distributed at the end of the voting period."
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: "Q: Can I vote on my own refund request?" }),
      /* @__PURE__ */ jsxs5("p", { children: [
        /* @__PURE__ */ jsx8("strong", { children: "A:" }),
        " No, you cannot vote on your own refund request. This prevents self-voting and ensures impartial community decisions."
      ] }),
      /* @__PURE__ */ jsx8("h3", { children: 'Q: What constitutes a "helpful answer" for penalty calculation?' }),
      /* @__PURE__ */ jsxs5("p", { children: [
        /* @__PURE__ */ jsx8("strong", { children: "A:" }),
        " An answer is considered helpful if it has received 2 or more votes. These answers are protected by the penalty system."
      ] }),
      /* @__PURE__ */ jsx8("h2", { children: "Getting Help" }),
      /* @__PURE__ */ jsx8("p", { children: "If you have questions about the refund system or need assistance with a specific case, you can reach out to the community through our Discord server or contact support directly." }),
      /* @__PURE__ */ jsxs5("div", { className: "mt-8 p-6 bg-violet-500/10 rounded-lg border border-violet-500/30", children: [
        /* @__PURE__ */ jsx8("h3", { className: "text-violet-300 mb-4", children: "Community Resources" }),
        /* @__PURE__ */ jsxs5("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs5(
            "a",
            {
              href: "https://discord.gg/zvB9gwhq",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx8(FiExternalLink, { className: "w-4 h-4 mr-2" }),
                "Join Discord Community"
              ]
            }
          ),
          /* @__PURE__ */ jsxs5(
            "a",
            {
              href: "/refund-requests",
              className: "inline-flex items-center px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx8(FiUsers, { className: "w-4 h-4 mr-2" }),
                "View Active Refund Requests"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] }) });
}

// app/routes/api.posts.$postId.tsx
var api_posts_postId_exports = {};
__export(api_posts_postId_exports, {
  action: () => action14,
  loader: () => loader6
});
init_schema();
import { json as json17 } from "@remix-run/cloudflare";
import { eq as eq14, and as and11 } from "drizzle-orm";
async function loader6({ params, context }) {
  let { postId } = params;
  if (!postId)
    return json17({ error: "Post ID is required" }, { status: 400 });
  try {
    let post = await context.env.DB.select().from(posts).where(eq14(posts.id, postId)).limit(1);
    return post.length ? json17({ post: post[0] }) : json17({ error: "Post not found" }, { status: 404 });
  } catch (error) {
    return console.error("Error fetching post:", error), json17({ error: "Failed to fetch post" }, { status: 500 });
  }
}
async function action14({ request, params, context }) {
  let { postId } = params;
  if (!postId)
    return json17({ error: "Post ID is required" }, { status: 400 });
  let formData = await request.formData(), action26 = formData.get("action");
  try {
    let db = context.env.DB;
    switch (action26) {
      case "addComment": {
        let content = formData.get("content"), userId = formData.get("userId"), answerId = formData.get("answerId");
        if (!content || !userId)
          return json17({ error: "Missing required fields" }, { status: 400 });
        let comment = await db.insert(comments).values({
          id: crypto.randomUUID(),
          content,
          authorId: userId,
          postId,
          answerId: answerId || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return json17({ success: !0, comment: comment[0] });
      }
      case "addAnswer": {
        let content = formData.get("content"), userId = formData.get("userId");
        if (!content || !userId)
          return json17({ error: "Missing required fields" }, { status: 400 });
        let answer = await db.insert(answers).values({
          id: crypto.randomUUID(),
          content,
          authorId: userId,
          postId,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return json17({ success: !0, answer: answer[0] });
      }
      case "vote": {
        let userId = formData.get("userId"), value = parseInt(formData.get("value")), voteType = formData.get("voteType"), isQualityVote = formData.get("isQualityVote") === "true";
        if (!userId || isNaN(value) || !voteType)
          return json17({ error: "Missing required fields" }, { status: 400 });
        let existingVote = await db.select().from(votes).where(
          and11(
            eq14(votes.postId, postId),
            eq14(votes.userId, userId),
            eq14(votes.voteType, voteType)
          )
        ).limit(1);
        existingVote.length > 0 ? await db.update(votes).set({
          value,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq14(votes.id, existingVote[0].id)) : await db.insert(votes).values({
          id: crypto.randomUUID(),
          postId,
          userId,
          value,
          voteType,
          isQualityVote,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
        let voteCounts = await db.select({
          totalVotes: votes.value
        }).from(votes).where(
          and11(
            eq14(votes.postId, postId),
            eq14(votes.voteType, voteType)
          )
        ), totalVotes = voteCounts.reduce((sum, vote) => sum + vote.totalVotes, 0), updateData = {};
        if (voteType === "visibility")
          updateData.visibilityVotes = totalVotes;
        else if (voteType === "quality") {
          let upvotes = voteCounts.filter((v) => v.totalVotes > 0).reduce((sum, v) => sum + v.totalVotes, 0), downvotes = voteCounts.filter((v) => v.totalVotes < 0).reduce((sum, v) => sum + Math.abs(v.totalVotes), 0);
          updateData.qualityUpvotes = upvotes, updateData.qualityDownvotes = downvotes;
        }
        return await db.update(posts).set(updateData).where(eq14(posts.id, postId)), json17({ success: !0, totalVotes });
      }
      case "updatePost": {
        let title = formData.get("title"), content = formData.get("content"), userId = formData.get("userId");
        if (!title || !content || !userId)
          return json17({ error: "Missing required fields" }, { status: 400 });
        let post = await db.select().from(posts).where(eq14(posts.id, postId)).limit(1);
        return !post.length || post[0].authorId !== userId ? json17({ error: "Unauthorized" }, { status: 401 }) : (await db.update(posts).set({
          title,
          content,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq14(posts.id, postId)), json17({ success: !0 }));
      }
      case "updateComment": {
        let content = formData.get("content"), commentId = formData.get("commentId"), userId = formData.get("userId");
        if (!content || !commentId || !userId)
          return json17({ error: "Missing required fields" }, { status: 400 });
        let comment = await db.select().from(comments).where(eq14(comments.id, commentId)).limit(1);
        return !comment.length || comment[0].authorId !== userId ? json17({ error: "Unauthorized" }, { status: 401 }) : (await db.update(comments).set({
          content,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq14(comments.id, commentId)), json17({ success: !0 }));
      }
      case "updateAnswer": {
        let content = formData.get("content"), answerId = formData.get("answerId"), userId = formData.get("userId");
        if (!content || !answerId || !userId)
          return json17({ error: "Missing required fields" }, { status: 400 });
        let answer = await db.select().from(answers).where(eq14(answers.id, answerId)).limit(1);
        return !answer.length || answer[0].authorId !== userId ? json17({ error: "Unauthorized" }, { status: 401 }) : (await db.update(answers).set({
          content,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq14(answers.id, answerId)), json17({ success: !0 }));
      }
      default:
        return json17({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return console.error("Error processing post action:", error), json17({ error: "Failed to process action" }, { status: 500 });
  }
}

// app/routes/api.bounty.claim.tsx
var api_bounty_claim_exports = {};
__export(api_bounty_claim_exports, {
  action: () => action15
});
import { json as json18 } from "@remix-run/cloudflare";
init_virtual_wallet_server();
init_schema();
import { eq as eq15 } from "drizzle-orm";
import { z as z7 } from "zod";
var claimBountySchema = z7.object({
  bountyId: z7.string().min(1, "Bounty ID is required")
});
async function action15({ request, context }) {
  try {
    let userId = await requireUserId(request), formData = await request.formData(), validation = claimBountySchema.safeParse({
      bountyId: formData.get("bountyId")
    });
    if (!validation.success)
      return json18({ error: validation.error.errors[0].message }, { status: 400 });
    let { bountyId } = validation.data, db = createDb(context.env.DB), bounty = await db.query.bounties.findFirst({
      where: eq15(bounties.id, bountyId)
    });
    if (!bounty)
      return json18({ error: "Bounty not found" }, { status: 404 });
    if (bounty.status !== "ACTIVE")
      return json18({ error: "Bounty is not active" }, { status: 400 });
    let post = await db.query.posts.findFirst({
      where: eq15(posts.id, bounty.postId)
    });
    return post && post.authorId === userId ? json18({ error: "You cannot claim your own bounty" }, { status: 400 }) : (await claimBounty(db, userId, bounty.amount, bounty.id), await db.update(bounties).set({
      status: "CLAIMED",
      winnerId: userId
    }).where(eq15(bounties.id, bountyId)).run(), json18({
      success: !0,
      message: `Successfully claimed bounty of ${bounty.amount} tokens`
    }));
  } catch (error) {
    return console.error("Claim bounty error:", error), json18({ error: "Failed to claim bounty" }, { status: 500 });
  }
}

// app/routes/api.posts.delete.tsx
var api_posts_delete_exports = {};
__export(api_posts_delete_exports, {
  action: () => action16
});
import { json as json19 } from "@remix-run/cloudflare";
init_schema();
import { eq as eq16 } from "drizzle-orm";
var action16 = async ({ request, context }) => {
  if (request.method !== "POST")
    return json19({ error: "Method not allowed" }, { status: 405 });
  try {
    let userId = await requireUserId(request), { postId } = await request.json();
    if (!postId)
      return json19({ error: "Post ID is required" }, { status: 400 });
    let db = context.env.DB, post = await db.select().from(posts).where(eq16(posts.id, postId)).limit(1);
    return !post.length || post[0].authorId !== userId ? json19({ error: "Unauthorized" }, { status: 401 }) : (await db.delete(posts).where(eq16(posts.id, postId)), json19({ success: !0 }));
  } catch (error) {
    return console.error("Delete post error:", error), json19({ error: "Failed to delete post" }, { status: 500 });
  }
};

// app/routes/profile.activity.tsx
var profile_activity_exports = {};
__export(profile_activity_exports, {
  default: () => ProfileActivity,
  loader: () => loader7
});
import { json as json20 } from "@remix-run/node";
init_schema();
import { eq as eq17, desc as desc7 } from "drizzle-orm";
import { useLoaderData as useLoaderData3, Link as Link4 } from "@remix-run/react";
import { FiMessageSquare, FiThumbsUp, FiCheckCircle, FiEdit2 } from "react-icons/fi";
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
var loader7 = async ({ request, context }) => {
  try {
    let userId = await requireUserId(request), db = context.env.DB, [userPosts, userComments, userAnswers, userReputationHistory] = await Promise.all([
      db.select().from(posts).where(eq17(posts.authorId, userId)).orderBy(desc7(posts.createdAt)).limit(100),
      db.select().from(comments).where(eq17(comments.authorId, userId)).orderBy(desc7(comments.createdAt)).limit(100),
      db.select().from(answers).where(eq17(answers.authorId, userId)).orderBy(desc7(answers.createdAt)).limit(100),
      db.select().from(reputationHistory).where(eq17(reputationHistory.userId, userId)).orderBy(desc7(reputationHistory.createdAt)).limit(100)
    ]), activityItems = [
      ...userPosts.map((post) => ({
        id: post.id,
        type: "post",
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        points: 0,
        action: "Created post"
      })),
      ...userComments.map((comment) => ({
        id: comment.id,
        type: "comment",
        title: "Comment",
        content: comment.content,
        createdAt: comment.createdAt,
        points: 0,
        action: "Added comment"
      })),
      ...userAnswers.map((answer) => ({
        id: answer.id,
        type: "answer",
        title: "Answer",
        content: answer.content,
        createdAt: answer.createdAt,
        points: 0,
        action: "Provided answer"
      })),
      ...userReputationHistory.map((history) => ({
        id: history.id,
        type: "reputation",
        title: history.action,
        content: history.description || "",
        createdAt: history.createdAt,
        points: history.points,
        action: history.action
      }))
    ];
    return activityItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), json20({ activityItems });
  } catch (error) {
    return console.error("Error loading profile activity:", error), json20({ activityItems: [] });
  }
};
function getActivityDescription(action26) {
  return {
    POST_CREATED: "Created a new post",
    POST_UPVOTED: "Received an upvote on your post",
    POST_DOWNVOTED: "Received a downvote on your post",
    COMMENT_CREATED: "Added a comment",
    COMMENT_UPVOTED: "Received an upvote on your comment",
    COMMENT_DOWNVOTED: "Received a downvote on your comment",
    ANSWER_CREATED: "Provided an answer",
    ANSWER_UPVOTED: "Received an upvote on your answer",
    ANSWER_DOWNVOTED: "Received a downvote on your answer",
    ANSWER_ACCEPTED: "Your answer was accepted as the best solution",
    PROFILE_COMPLETED: "Completed your profile information",
    DAILY_LOGIN: "Logged in for the day",
    WEEKLY_STREAK: "Maintained a weekly activity streak",
    MONTHLY_CONTRIBUTOR: "Active contributor this month",
    HELPFUL_MEMBER: "Recognized as a helpful community member",
    FIRST_POST: "Created your first post",
    FIRST_ANSWER: "Provided your first answer",
    FIRST_COMMENT: "Added your first comment",
    REPUTATION_MILESTONE: "Reached a reputation milestone",
    COMMUNITY_ENGAGEMENT: "Active participation in the community",
    CREATE_POST: "Created a new post"
  }[action26] || action26;
}
function ProfileActivity() {
  let { activities } = useLoaderData3(), getActivityIcon = (type) => {
    switch (type) {
      case "post":
        return /* @__PURE__ */ jsx9(FiEdit2, { className: "w-5 h-5" });
      case "comment":
        return /* @__PURE__ */ jsx9(FiMessageSquare, { className: "w-5 h-5" });
      case "answer":
        return /* @__PURE__ */ jsx9(FiCheckCircle, { className: "w-5 h-5" });
      case "reputation":
        return /* @__PURE__ */ jsx9(FiThumbsUp, { className: "w-5 h-5" });
      default:
        return null;
    }
  }, getActivityTitle = (activity) => {
    switch (activity.type) {
      case "post":
        return "Created a post";
      case "comment":
        return "Commented on a post";
      case "answer":
        return "Answered a question";
      case "reputation":
        return activity.action?.replace(/_/g, " ").toLowerCase() || "Reputation change";
      default:
        return "";
    }
  };
  return /* @__PURE__ */ jsxs6("div", { className: "bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] mt-8", children: [
    /* @__PURE__ */ jsxs6("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx9("h2", { className: "text-2xl font-bold text-white", children: "Activity History" }),
      /* @__PURE__ */ jsx9(Link4, { to: "/profile", className: "px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors border-2 border-violet-500/50 shadow-md", children: "Back to Profile" })
    ] }),
    /* @__PURE__ */ jsx9("div", { className: "space-y-4", children: activities.length === 0 ? /* @__PURE__ */ jsx9("div", { className: "text-gray-400 text-center", children: "No activity yet." }) : activities.map((activity) => /* @__PURE__ */ jsx9("div", { className: "bg-neutral-700/50 rounded-lg border border-violet-500/30 p-4", children: /* @__PURE__ */ jsxs6("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxs6("div", { className: "p-2 bg-violet-500/20 rounded-lg", children: [
        activity.type === "post" && /* @__PURE__ */ jsx9(FiEdit2, { className: "w-5 h-5 text-violet-300" }),
        activity.type === "comment" && /* @__PURE__ */ jsx9(FiMessageSquare, { className: "w-5 h-5 text-violet-300" }),
        activity.type === "answer" && /* @__PURE__ */ jsx9(FiCheckCircle, { className: "w-5 h-5 text-violet-300" }),
        activity.type === "reputation" && /* @__PURE__ */ jsx9(FiThumbsUp, { className: "w-5 h-5 text-violet-300" })
      ] }),
      /* @__PURE__ */ jsx9("div", { className: "flex-1", children: /* @__PURE__ */ jsxs6("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsxs6("h3", { className: "text-lg font-medium text-violet-300", children: [
            activity.type === "post" && activity.title,
            activity.type === "comment" && "Comment on: " + activity.title,
            activity.type === "answer" && "Answer to: " + activity.title,
            activity.type === "reputation" && getActivityDescription(activity.action || "")
          ] }),
          (activity.type === "post" || activity.type === "comment" || activity.type === "answer") && /* @__PURE__ */ jsx9("p", { className: "mt-2 text-gray-300 line-clamp-2", children: activity.content })
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "flex flex-col items-end", children: [
          /* @__PURE__ */ jsx9("p", { className: "text-sm text-gray-400", children: new Date(activity.createdAt).toLocaleDateString() }),
          activity.type === "reputation" && activity.points && /* @__PURE__ */ jsxs6("p", { className: `text-sm font-medium ${activity.points > 0 ? "text-green-400" : "text-red-400"}`, children: [
            activity.points > 0 ? "+" : "",
            activity.points,
            " points"
          ] })
        ] })
      ] }) })
    ] }) }, activity.id)) })
  ] });
}

// app/routes/$username.posts.tsx
var username_posts_exports = {};
__export(username_posts_exports, {
  action: () => action17,
  default: () => UserPosts,
  loader: () => loader8
});
import { useState as useState4 } from "react";
import { useLoaderData as useLoaderData4, Link as Link5, useActionData, useNavigate, useSubmit, useSearchParams } from "@remix-run/react";
import { json as json21 } from "@remix-run/node";
init_schema();
import { FiThumbsUp as FiThumbsUp2, FiMessageSquare as FiMessageSquare2 } from "react-icons/fi";
import { json as cloudflareJson } from "@remix-run/cloudflare";
import { eq as eq18, inArray as inArray2, sql as sql7 } from "drizzle-orm";
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
async function loader8({ params, context, request }) {
  let { username } = params;
  if (!username)
    throw new Response("Username is required", { status: 400 });
  try {
    let db = context.env.DB, currentUser = await getUser(request), user = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
      reputationPoints: users.reputationPoints,
      integrityScore: users.integrityScore,
      totalRatings: users.totalRatings
    }).from(users).where(eq18(users.username, username)).limit(1);
    if (!user.length)
      throw new Response("User not found", { status: 404 });
    let userPosts = await db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      visibilityVotes: posts.visibilityVotes,
      qualityUpvotes: posts.qualityUpvotes,
      qualityDownvotes: posts.qualityDownvotes,
      hasBounty: posts.hasBounty,
      status: posts.status,
      author: {
        id: users.id,
        username: users.username
      },
      profile: {
        profilePicture: profiles.profilePicture
      }
    }).from(posts).innerJoin(users, eq18(posts.authorId, users.id)).leftJoin(profiles, eq18(users.id, profiles.userId)).where(eq18(posts.authorId, user[0].id)).orderBy(posts.createdAt), postIds = userPosts.map((post) => post.id), commentCounts = postIds.length > 0 ? await db.select({
      postId: comments.postId,
      count: sql7`count(${comments.id})`
    }).from(comments).where(inArray2(comments.postId, postIds)).groupBy(comments.postId) : [], transformedPosts = userPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      visibilityVotes: post.visibilityVotes,
      upvotes: post.qualityUpvotes,
      comments: commentCounts.find((c) => c.postId === post.id)?.count || 0,
      hasBounty: post.hasBounty,
      author: {
        id: post.author.id,
        username: post.author.username,
        profilePicture: post.profile?.profilePicture || null
      }
    }));
    return json21({
      user: user[0],
      posts: transformedPosts,
      currentUser
    });
  } catch (error) {
    throw console.error("Error fetching user posts:", error), new Response("Failed to fetch user posts", { status: 500 });
  }
}
async function action17({ request, params, context }) {
  let user = await getUser(request);
  if (!user)
    throw new Response("Unauthorized", { status: 401 });
  let formData = await request.formData(), action26 = formData.get("action");
  try {
    let db = context.env.DB;
    switch (action26) {
      case "deletePost": {
        let postId = formData.get("postId");
        if (!postId)
          return cloudflareJson({ error: "Post ID is required" }, { status: 400 });
        let post = await db.select().from(posts).where(eq18(posts.id, postId)).limit(1);
        return !post.length || post[0].authorId !== user.id ? cloudflareJson({ error: "Unauthorized" }, { status: 401 }) : (await db.delete(posts).where(eq18(posts.id, postId)), cloudflareJson({ success: !0 }));
      }
      default:
        return cloudflareJson({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return console.error("Error processing action:", error), cloudflareJson({ error: "Failed to process action" }, { status: 500 });
  }
}
function UserPosts() {
  let { user, posts: posts2, currentUser } = useLoaderData4(), [videoErrors, setVideoErrors] = useState4({}), submit = useSubmit(), navigate = useNavigate(), actionData = useActionData(), [searchParams, setSearchParams] = useSearchParams(), POSTS_PER_PAGE = 6, page = parseInt(searchParams.get("page") || "1", 10), totalPosts = posts2.length, totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE), paginatedPosts = posts2.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE), handleVideoError = (postId, error) => {
    setVideoErrors((prev) => ({ ...prev, [postId]: error }));
  }, handleVote = (postId) => {
    let formData = new FormData();
    formData.append("action", "vote"), formData.append("postId", postId), submit(formData, { method: "post" });
  }, handleDelete = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      let formData = new FormData();
      formData.append("action", "deletePost"), formData.append("postId", postId), submit(formData, { method: "post" });
    }
  }, isPostOwner = (post) => currentUser?.id === post.author.id, renderPost = (post) => /* @__PURE__ */ jsxs7("div", { className: "bg-neutral-800 rounded-lg p-6 mb-6", children: [
    /* @__PURE__ */ jsx10("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs7("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsx10(
        "img",
        {
          src: post.author.profilePicture || "/default-avatar.svg",
          alt: `${post.author.username}'s profile`,
          className: "w-10 h-10 rounded-full object-cover"
        }
      ),
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx10(Link5, { to: "/profile", className: "text-white hover:text-violet-400", children: post.author.username }),
        /* @__PURE__ */ jsx10("p", { className: "text-sm text-gray-400", children: new Date(post.createdAt).toLocaleDateString() })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs7(Link5, { to: `/posts/${post.id}`, className: "block", children: [
      /* @__PURE__ */ jsx10("h2", { className: "text-xl font-bold text-white mb-2", children: post.title }),
      /* @__PURE__ */ jsx10("p", { className: "text-gray-300 mb-4", children: post.content })
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "flex items-center justify-between mt-4 pt-4 border-t border-gray-700", children: /* @__PURE__ */ jsxs7("div", { className: "flex items-center space-x-4", children: [
      /* @__PURE__ */ jsxs7("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx10(FiThumbsUp2, { className: "w-5 h-5 text-gray-400" }),
        /* @__PURE__ */ jsx10("span", { className: "text-gray-400", children: post.upvotes })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx10(FiMessageSquare2, { className: "w-5 h-5 text-gray-400" }),
        /* @__PURE__ */ jsx10("span", { className: "text-gray-400", children: post.comments })
      ] })
    ] }) })
  ] }, post.id);
  return /* @__PURE__ */ jsxs7("div", { className: "h-screen w-full bg-neutral-900/95 flex flex-row", children: [
    /* @__PURE__ */ jsx10(Nav, {}),
    /* @__PURE__ */ jsx10("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxs7("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16", children: [
      /* @__PURE__ */ jsxs7("div", { className: "mb-6 flex justify-between items-center mt-16", children: [
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsxs7("h1", { className: "text-2xl font-bold text-white mb-2", children: [
            "Posts by ",
            user.username
          ] }),
          /* @__PURE__ */ jsxs7("p", { className: "text-gray-400 text-sm", children: [
            posts2.length,
            " ",
            posts2.length === 1 ? "post" : "posts"
          ] })
        ] }),
        /* @__PURE__ */ jsx10(
          Link5,
          {
            to: "/posts/create",
            className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2",
            children: /* @__PURE__ */ jsx10("span", { children: "Create Post" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx10("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4", children: paginatedPosts.map(
        (post) => renderPost(post)
      ) }),
      totalPages > 1 && /* @__PURE__ */ jsxs7("div", { className: "flex justify-center mt-8 space-x-2", children: [
        /* @__PURE__ */ jsx10(
          "button",
          {
            onClick: () => setSearchParams({ page: String(page - 1) }),
            disabled: page === 1,
            className: "px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50",
            children: "Previous"
          }
        ),
        Array.from({ length: totalPages }, (_, i) => /* @__PURE__ */ jsx10(
          "button",
          {
            onClick: () => setSearchParams({ page: String(i + 1) }),
            className: `px-3 py-1 rounded ${page === i + 1 ? "bg-violet-500 text-white" : "bg-gray-700 text-white"}`,
            children: i + 1
          },
          i + 1
        )),
        /* @__PURE__ */ jsx10(
          "button",
          {
            onClick: () => setSearchParams({ page: String(page + 1) }),
            disabled: page === totalPages,
            className: "px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50",
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}

// app/routes/api.privacy.pdf.tsx
var api_privacy_pdf_exports = {};
__export(api_privacy_pdf_exports, {
  loader: () => loader9
});
import { json as json22 } from "@remix-run/cloudflare";

// app/utils/pdf.server.ts
import { renderToString } from "react-dom/server";
var puppeteer = null;
try {
  puppeteer = __require("puppeteer");
} catch {
  console.warn("Puppeteer not available in current environment");
}
var PDFService = class {
  static async getBrowser() {
    if (!puppeteer)
      throw new Error("Puppeteer is not available in this environment");
    return this.browser || (this.browser = await puppeteer.launch({
      headless: !0,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })), this.browser;
  }
  static async generatePDF(htmlContent, options = {}) {
    if (!puppeteer)
      throw new Error("PDF generation is not available in this environment");
    let page = await (await this.getBrowser()).newPage();
    try {
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0"
      });
      let pdfBuffer = await page.pdf({
        format: options.format || "A4",
        margin: options.margin || {
          top: "1in",
          right: "1in",
          bottom: "1in",
          left: "1in"
        },
        printBackground: options.printBackground ?? !0,
        displayHeaderFooter: options.displayHeaderFooter ?? !1,
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }
  static async generatePDFFromReactComponent(component, options = {}) {
    if (!puppeteer)
      throw new Error("PDF generation is not available in this environment");
    let fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #000;
              margin-top: 0;
              page-break-after: avoid;
            }
            p, li {
              color: #333;
              page-break-inside: avoid;
            }
            ul, ol {
              margin: 0;
              padding-left: 20px;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
            }
          </style>
        </head>
        <body>
          ${renderToString(component)}
        </body>
      </html>
    `;
    return this.generatePDF(fullHTML, options);
  }
  static async closeBrowser() {
    this.browser && (await this.browser.close(), this.browser = null);
  }
  // Check if PDF generation is available
  static isAvailable() {
    return puppeteer !== null;
  }
};
__publicField(PDFService, "browser", null);
async function createSimplePDF(title, content, options = {}) {
  if (!puppeteer)
    throw new Error("PDF generation is not available in this environment");
  let htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #000;
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          h2 {
            color: #000;
            margin-top: 30px;
            margin-bottom: 15px;
            page-break-after: avoid;
          }
          h3 {
            color: #000;
            margin-top: 25px;
            margin-bottom: 10px;
          }
          p, li {
            color: #333;
            page-break-inside: avoid;
            margin-bottom: 10px;
          }
          ul, ol {
            margin: 0;
            padding-left: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .contact-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
          }
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">
          ${content}
        </div>
      </body>
    </html>
  `;
  return PDFService.generatePDF(htmlContent, options);
}

// app/routes/api.privacy.pdf.tsx
var loader9 = async ({ request }) => {
  try {
    let pdfBuffer = await createSimplePDF(
      "Privacy Policy - portal.ask",
      `
      <div class="section">
        <h2>1. Introduction</h2>
        <p>Welcome to portal.ask ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized platform for knowledge sharing and community building.</p>
        <p>By using portal.ask, you consent to the data practices described in this policy.</p>
      </div>

      <div class="section">
        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Personal Information</h3>
        <p>We may collect the following personal information:</p>
        <ul>
          <li>Email address</li>
          <li>Username</li>
          <li>Profile information (bio, location, website)</li>
          <li>Social media links</li>
          <li>Profile picture</li>
          <li>Solana wallet addresses</li>
        </ul>

        <h3>2.2 Usage Information</h3>
        <p>We automatically collect certain information about your use of our platform:</p>
        <ul>
          <li>Posts, comments, and interactions</li>
          <li>Voting and reputation data</li>
          <li>Transaction history</li>
          <li>IP address and device information</li>
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
        </ul>

        <h3>2.3 Blockchain Data</h3>
        <p>As a decentralized platform, some information may be stored on the Solana blockchain, which is publicly accessible and immutable.</p>
      </div>

      <div class="section">
        <h2>3. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li>Provide and maintain our platform services</li>
          <li>Process transactions and manage virtual wallets</li>
          <li>Calculate and display reputation scores</li>
          <li>Facilitate community interactions</li>
          <li>Send important notifications and updates</li>
          <li>Improve our platform and user experience</li>
          <li>Comply with legal obligations</li>
          <li>Prevent fraud and abuse</li>
        </ul>
      </div>

      <div class="section">
        <h2>4. Information Sharing and Disclosure</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:</p>
        <ul>
          <li><strong>Public Content:</strong> Posts, comments, and public profile information are visible to all users</li>
          <li><strong>Blockchain Transactions:</strong> Transaction data is publicly visible on the Solana blockchain</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in platform operations</li>
          <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
        </ul>
      </div>

      <div class="section">
        <h2>5. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information:</p>
        <ul>
          <li>Encryption of sensitive data</li>
          <li>Secure authentication systems</li>
          <li>Regular security audits</li>
          <li>Access controls and monitoring</li>
          <li>Secure hosting infrastructure</li>
        </ul>
        <p>However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
      </div>

      <div class="section">
        <h2>6. Your Rights and Choices</h2>
        <p>You have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request access to your personal information</li>
          <li><strong>Correction:</strong> Update or correct your information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
          <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
        </ul>
        <p>Note: Some data stored on the blockchain may be immutable and cannot be deleted.</p>
      </div>

      <div class="section">
        <h2>7. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Maintain your session and preferences</li>
          <li>Analyze platform usage and performance</li>
          <li>Provide personalized content</li>
          <li>Improve user experience</li>
        </ul>
        <p>You can control cookie settings through your browser preferences.</p>
      </div>

      <div class="section">
        <h2>8. Third-Party Services</h2>
        <p>Our platform may integrate with third-party services:</p>
        <ul>
          <li>Solana blockchain network</li>
          <li>Cloudinary for media storage</li>
          <li>Authentication providers</li>
          <li>Analytics services</li>
        </ul>
        <p>These services have their own privacy policies, and we encourage you to review them.</p>
      </div>

      <div class="section">
        <h2>9. Children's Privacy</h2>
        <p>Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.</p>
      </div>

      <div class="section">
        <h2>10. International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.</p>
      </div>

      <div class="section">
        <h2>11. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
        <ul>
          <li>Posting the updated policy on our platform</li>
          <li>Sending email notifications to registered users</li>
          <li>Displaying prominent notices on our website</li>
        </ul>
        <p>Your continued use of the platform after changes become effective constitutes acceptance of the updated policy.</p>
      </div>

      <div class="section">
        <h2>12. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
        <div class="contact-info">
          <p><strong>Email:</strong> bountybucks524@gmail.com</p>
          <p><strong>Platform:</strong> portal.ask</p>
          <p>We will respond to your inquiry within a reasonable timeframe.</p>
        </div>
      </div>

      <div class="section">
        <h2>13. Governing Law</h2>
        <p>This Privacy Policy is governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates. Any disputes arising from this policy will be resolved in the appropriate courts of that jurisdiction.</p>
      </div>
    `,
      {
        format: "A4",
        margin: {
          top: "1in",
          right: "1in",
          bottom: "1in",
          left: "1in"
        }
      }
    );
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="portal-ask-privacy-policy.pdf"',
        "Content-Length": pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    return console.error("Error generating privacy policy PDF:", error), json22({ error: "Failed to generate PDF" }, { status: 500 });
  }
};

// app/routes/api.refund.vote.tsx
var api_refund_vote_exports = {};
__export(api_refund_vote_exports, {
  action: () => action18
});
import { json as json23 } from "@remix-run/cloudflare";
import { z as z8 } from "zod";
var refundVoteSchema = z8.object({
  refundRequestId: z8.string(),
  vote: z8.boolean(),
  reason: z8.string().min(20, "Must provide at least 20 characters of reasoning")
});
async function action18({ request, context }) {
  let userId = await requireUserId(request);
  if (request.method !== "POST")
    return json23({ error: "Method not allowed" }, { status: 405 });
  try {
    let formData = await request.formData(), refundRequestId = formData.get("refundRequestId"), vote = formData.get("vote") === "true", reason = formData.get("reason") || void 0, validatedData = refundVoteSchema.parse({ refundRequestId, vote, reason }), db = context.env.DB, voteRecord = await voteOnRefundRequest(
      db,
      validatedData.refundRequestId,
      userId,
      validatedData.vote,
      validatedData.reason
    );
    return json23({
      success: !0,
      vote: voteRecord,
      message: `Vote ${validatedData.vote ? "approved" : "rejected"} successfully. You'll receive ${voteRecord.rewardAmount.toFixed(4)} tokens when the final decision is reached.`
    });
  } catch (error) {
    return console.error("Refund vote error:", error), error instanceof z8.ZodError ? json23({ error: "Invalid input data", details: error.errors }, { status: 400 }) : error instanceof Error ? json23({ error: error.message }, { status: 400 }) : json23({ error: "Failed to vote on refund request" }, { status: 500 });
  }
}

// app/routes/refund-requests.tsx
var refund_requests_exports = {};
__export(refund_requests_exports, {
  default: () => RefundRequestsPage,
  loader: () => loader10
});
import { json as json24 } from "@remix-run/node";
import { useLoaderData as useLoaderData5 } from "@remix-run/react";

// app/components/RefundRequestsList.tsx
import { useState as useState5 } from "react";
import { Form as Form3, useActionData as useActionData2, useNavigation } from "@remix-run/react";
import { jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
function RefundRequestsList({ refundRequests: refundRequests2 }) {
  let actionData = useActionData2(), navigation = useNavigation(), [selectedRequest, setSelectedRequest] = useState5(null), [voteReason, setVoteReason] = useState5(""), isSubmitting = navigation.state === "submitting", handleVote = (requestId) => {
    setSelectedRequest(requestId), setVoteReason("");
  }, formatTimeRemaining = (expiresAt) => {
    let now = /* @__PURE__ */ new Date(), diff = new Date(expiresAt).getTime() - now.getTime();
    if (diff <= 0)
      return "Expired";
    let hours = Math.floor(diff / (1e3 * 60 * 60)), minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
    return `${hours}h ${minutes}m remaining`;
  };
  return refundRequests2.length === 0 ? /* @__PURE__ */ jsxs8("div", { className: "text-center py-8", children: [
    /* @__PURE__ */ jsx11("p", { className: "text-gray-400", children: "No active refund requests to vote on." }),
    /* @__PURE__ */ jsx11("p", { className: "text-gray-500 text-sm mt-2", children: "Check back later for new requests!" })
  ] }) : /* @__PURE__ */ jsxs8("div", { className: "space-y-4", children: [
    actionData?.success && /* @__PURE__ */ jsx11("div", { className: "bg-green-900/20 border border-green-500 rounded-lg p-4", children: /* @__PURE__ */ jsx11("p", { className: "text-green-400 text-sm", children: actionData.message }) }),
    actionData?.error && /* @__PURE__ */ jsx11("div", { className: "bg-red-900/20 border border-red-500 rounded-lg p-4", children: /* @__PURE__ */ jsx11("p", { className: "text-red-400 text-sm", children: actionData.error }) }),
    refundRequests2.map((request) => /* @__PURE__ */ jsxs8("div", { className: "bg-neutral-800 rounded-lg p-4 border border-neutral-700", children: [
      /* @__PURE__ */ jsxs8("div", { className: "flex justify-between items-start mb-3", children: [
        /* @__PURE__ */ jsxs8("div", { children: [
          /* @__PURE__ */ jsxs8("h3", { className: "text-white font-semibold", children: [
            "Refund Request by @",
            request.requester.username
          ] }),
          /* @__PURE__ */ jsxs8("p", { className: "text-gray-400 text-sm", children: [
            "Bounty: ",
            request.bounty.amount,
            " SOL \u2022 ",
            request.bounty.post.answers.length,
            " answers"
          ] }),
          /* @__PURE__ */ jsxs8("p", { className: "text-gray-500 text-xs", children: [
            formatTimeRemaining(request.expiresAt),
            " \u2022 ",
            request.communityVotes,
            "/",
            request.requiredVotes,
            " votes"
          ] })
        ] }),
        /* @__PURE__ */ jsx11("div", { className: "text-right", children: /* @__PURE__ */ jsxs8("span", { className: "text-yellow-400 font-semibold", children: [
          request.bounty.amount,
          " SOL"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs8("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxs8("p", { className: "text-gray-300 text-sm mb-2", children: [
          /* @__PURE__ */ jsx11("strong", { children: "Reason:" }),
          " ",
          request.reason
        ] }),
        /* @__PURE__ */ jsxs8("p", { className: "text-gray-400 text-xs", children: [
          /* @__PURE__ */ jsx11("strong", { children: "Post:" }),
          " ",
          request.bounty.post.title
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs8("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx11(
            "button",
            {
              onClick: () => handleVote(request.id),
              disabled: isSubmitting,
              className: "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50",
              children: "Approve"
            }
          ),
          /* @__PURE__ */ jsx11(
            "button",
            {
              onClick: () => handleVote(request.id),
              disabled: isSubmitting,
              className: "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50",
              children: "Reject"
            }
          )
        ] }),
        /* @__PURE__ */ jsx11("div", { className: "text-xs text-gray-500", children: request.votes.length > 0 && /* @__PURE__ */ jsxs8("span", { children: [
          "Votes: ",
          request.votes.filter((v) => v.vote).length,
          " approve, ",
          request.votes.filter((v) => !v.vote).length,
          " reject"
        ] }) })
      ] }),
      selectedRequest === request.id && /* @__PURE__ */ jsxs8("div", { className: "mt-4 p-4 bg-neutral-700 rounded-lg", children: [
        /* @__PURE__ */ jsx11("h4", { className: "text-white font-medium mb-2", children: "Vote on Refund Request" }),
        /* @__PURE__ */ jsxs8("div", { className: "mb-3 p-3 bg-blue-900/20 border border-blue-500 rounded text-xs text-blue-300", children: [
          /* @__PURE__ */ jsx11("p", { className: "font-medium mb-1", children: "Voting Requirements:" }),
          /* @__PURE__ */ jsxs8("ul", { className: "space-y-1 text-blue-200", children: [
            /* @__PURE__ */ jsx11("li", { children: "\u2022 50+ reputation points & 7+ days account age" }),
            /* @__PURE__ */ jsx11("li", { children: "\u2022 Must have previously engaged with this post" }),
            /* @__PURE__ */ jsx11("li", { children: "\u2022 Minimum 20 characters of reasoning required" }),
            /* @__PURE__ */ jsx11("li", { children: "\u2022 5-minute minimum review time" }),
            /* @__PURE__ */ jsx11("li", { children: "\u2022 Max 10 votes per 24 hours" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs8(Form3, { method: "post", action: "/api/refund/vote", children: [
          /* @__PURE__ */ jsx11("input", { type: "hidden", name: "refundRequestId", value: request.id }),
          /* @__PURE__ */ jsxs8("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx11("label", { htmlFor: "voteReason", className: "block text-sm text-gray-300 mb-1", children: "Reasoning for Vote *" }),
            /* @__PURE__ */ jsx11(
              "textarea",
              {
                id: "voteReason",
                name: "reason",
                value: voteReason,
                onChange: (e) => setVoteReason(e.target.value),
                required: !0,
                minLength: 20,
                rows: 3,
                className: "w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                placeholder: "Explain your vote reasoning (minimum 20 characters)..."
              }
            ),
            /* @__PURE__ */ jsxs8("p", { className: "text-xs text-gray-500 mt-1", children: [
              voteReason.length,
              "/20 characters minimum"
            ] })
          ] }),
          /* @__PURE__ */ jsxs8("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx11(
              "button",
              {
                type: "submit",
                name: "vote",
                value: "true",
                disabled: isSubmitting || voteReason.length < 20,
                className: "px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                children: isSubmitting ? "Submitting..." : "Approve"
              }
            ),
            /* @__PURE__ */ jsx11(
              "button",
              {
                type: "submit",
                name: "vote",
                value: "false",
                disabled: isSubmitting || voteReason.length < 20,
                className: "px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                children: isSubmitting ? "Submitting..." : "Reject"
              }
            ),
            /* @__PURE__ */ jsx11(
              "button",
              {
                type: "button",
                onClick: () => setSelectedRequest(null),
                className: "px-4 py-2 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-500 transition-colors",
                children: "Cancel"
              }
            )
          ] })
        ] })
      ] })
    ] }, request.id))
  ] });
}

// app/routes/refund-requests.tsx
init_schema();
import { eq as eq19 } from "drizzle-orm";
import { jsx as jsx12, jsxs as jsxs9 } from "react/jsx-runtime";
async function loader10({ request, context }) {
  let userId = await requireUserId(request);
  try {
    let db = context.env.DB, requests = await db.select({
      id: refundRequests.id,
      reason: refundRequests.reason,
      status: refundRequests.status,
      createdAt: refundRequests.createdAt,
      expiresAt: refundRequests.expiresAt,
      communityVotes: refundRequests.communityVotes,
      requiredVotes: refundRequests.requiredVotes,
      bountyId: refundRequests.bountyId,
      requesterId: refundRequests.requesterId
    }).from(refundRequests).where(eq19(refundRequests.status, "PENDING")).orderBy(refundRequests.createdAt), validRequests = (await Promise.all(
      requests.map(async (request2) => {
        let bounty = await db.select({
          amount: bounties.amount,
          postId: bounties.postId
        }).from(bounties).where(eq19(bounties.id, request2.bountyId)).get();
        if (!bounty)
          return null;
        let post = await db.select({
          title: posts.title,
          authorId: posts.authorId
        }).from(posts).where(eq19(posts.id, bounty.postId)).get();
        if (!post)
          return null;
        let answersCount = await db.select({ count: answers.id }).from(answers).where(eq19(answers.postId, bounty.postId)).all(), requester = await db.select({
          username: users.username
        }).from(users).where(eq19(users.id, request2.requesterId)).get(), votes3 = await db.select({
          id: refundRequestVotes.id,
          vote: refundRequestVotes.vote,
          voterId: refundRequestVotes.voterId,
          reason: refundRequestVotes.reason,
          createdAt: refundRequestVotes.createdAt,
          rewardAmount: refundRequestVotes.rewardAmount
        }).from(refundRequestVotes).where(eq19(refundRequestVotes.refundRequestId, request2.id)).all();
        return {
          id: request2.id,
          reason: request2.reason,
          status: request2.status,
          createdAt: request2.createdAt.toISOString(),
          expiresAt: request2.expiresAt.toISOString(),
          communityVotes: request2.communityVotes,
          requiredVotes: request2.requiredVotes,
          bounty: {
            amount: bounty.amount,
            post: {
              title: post.title,
              answers: Array(answersCount.length).fill({ id: "placeholder" }),
              author: { username: "Unknown" }
              // We'd need to join with users to get this
            }
          },
          requester: { username: requester?.username || "Unknown" },
          votes: votes3.map((vote) => ({
            ...vote,
            createdAt: vote.createdAt.toISOString()
          }))
        };
      })
    )).filter(Boolean);
    return json24({
      refundRequests: validRequests,
      count: validRequests.length
    });
  } catch (error) {
    return console.error("Load refund requests error:", error), json24({
      refundRequests: [],
      count: 0,
      error: error instanceof Error ? error.message : "Failed to load refund requests"
    });
  }
}
function RefundRequestsPage() {
  let data = useLoaderData5(), { refundRequests: refundRequests2, count } = data, error = "error" in data ? data.error : void 0;
  return /* @__PURE__ */ jsx12(Layout, { children: /* @__PURE__ */ jsxs9("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 pb-16", children: [
    /* @__PURE__ */ jsxs9("div", { className: "mb-6 flex justify-between items-center mt-16", children: [
      /* @__PURE__ */ jsxs9("div", { children: [
        /* @__PURE__ */ jsx12("h1", { className: "text-2xl font-bold text-white", children: "Refund Requests" }),
        /* @__PURE__ */ jsx12("p", { className: "text-gray-400 text-sm mt-1", children: "Help the community by voting on refund requests. Earn tokens for participating in governance (5% fee)!" })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx12("div", { className: "text-2xl font-bold text-indigo-400", children: count }),
        /* @__PURE__ */ jsx12("div", { className: "text-gray-400 text-sm", children: "Active Requests" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsx12("div", { className: "bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsx12("p", { className: "text-red-400", children: error }) }),
    /* @__PURE__ */ jsxs9("div", { className: "bg-neutral-900/50 rounded-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx12("h2", { className: "text-lg font-semibold text-white mb-3", children: "How it works" }),
      /* @__PURE__ */ jsxs9("div", { className: "grid md:grid-cols-3 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs9("div", { className: "bg-neutral-800 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsx12("h3", { className: "font-medium text-indigo-400 mb-2", children: "1. Review Requests" }),
          /* @__PURE__ */ jsx12("p", { className: "text-gray-300", children: "Read the refund reason and check if the bounty has helpful answers." })
        ] }),
        /* @__PURE__ */ jsxs9("div", { className: "bg-neutral-800 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsx12("h3", { className: "font-medium text-indigo-400 mb-2", children: "2. Vote Wisely" }),
          /* @__PURE__ */ jsx12("p", { className: "text-gray-300", children: "Approve legitimate refunds, reject attempts to get free help." })
        ] }),
        /* @__PURE__ */ jsxs9("div", { className: "bg-neutral-800 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsx12("h3", { className: "font-medium text-indigo-400 mb-2", children: "3. Earn Rewards" }),
          /* @__PURE__ */ jsx12("p", { className: "text-gray-300", children: "Get tokens (5% of bounty) and reputation points for participating in governance." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx12(RefundRequestsList, { refundRequests: refundRequests2 })
  ] }) });
}

// app/routes/api.terms.pdf.tsx
var api_terms_pdf_exports = {};
__export(api_terms_pdf_exports, {
  loader: () => loader11
});
import { json as json25 } from "@remix-run/cloudflare";
var loader11 = async ({ request }) => {
  try {
    let pdfBuffer = await createSimplePDF(
      "Terms of Service - portal.ask",
      `
      <div class="section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using portal.ask ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
        <p>These Terms of Service ("Terms") govern your use of our decentralized platform for knowledge sharing, community building, and reputation-based interactions.</p>
      </div>

      <div class="section">
        <h2>2. Description of Service</h2>
        <p>portal.ask is a decentralized platform that provides:</p>
        <ul>
          <li>Knowledge sharing and Q&A functionality</li>
          <li>Community building and interaction tools</li>
          <li>Reputation and integrity scoring systems</li>
          <li>Virtual wallet and token management</li>
          <li>Bounty and reward mechanisms</li>
          <li>Blockchain-based transaction processing</li>
        </ul>
      </div>

      <div class="section">
        <h2>3. User Accounts and Registration</h2>
        
        <h3>3.1 Account Creation</h3>
        <p>To access certain features of the Platform, you must create an account. You agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your account information</li>
          <li>Keep your account credentials secure</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized use</li>
        </ul>

        <h3>3.2 Account Eligibility</h3>
        <p>You must be at least 13 years old to create an account. By creating an account, you represent and warrant that you meet this age requirement.</p>
      </div>

      <div class="section">
        <h2>4. User Conduct and Responsibilities</h2>
        
        <h3>4.1 Acceptable Use</h3>
        <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Harass, abuse, or harm other users</li>
          <li>Post false, misleading, or fraudulent content</li>
          <li>Attempt to gain unauthorized access to the Platform</li>
          <li>Interfere with the Platform's operation or security</li>
          <li>Use automated systems to access the Platform</li>
          <li>Engage in spam or unsolicited communications</li>
        </ul>

        <h3>4.2 Content Standards</h3>
        <p>All content you post must:</p>
        <ul>
          <li>Be accurate and truthful</li>
          <li>Respect intellectual property rights</li>
          <li>Not contain harmful, offensive, or inappropriate material</li>
          <li>Comply with community guidelines</li>
          <li>Not violate any third-party rights</li>
        </ul>
      </div>

      <div class="section">
        <h2>5. Virtual Currency and Transactions</h2>
        
        <h3>5.1 PORTAL Tokens</h3>
        <p>The Platform uses PORTAL tokens as virtual currency for:</p>
        <ul>
          <li>Creating bounties and rewards</li>
          <li>Community transactions</li>
          <li>Platform governance</li>
          <li>Reputation and integrity systems</li>
        </ul>

        <h3>5.2 Transaction Terms</h3>
        <p>By using the Platform's transaction features, you agree to:</p>
        <ul>
          <li>Understand that transactions are irreversible</li>
          <li>Accept responsibility for all transactions initiated from your account</li>
          <li>Comply with applicable financial regulations</li>
          <li>Not engage in fraudulent or manipulative trading</li>
          <li>Pay any applicable fees or charges</li>
        </ul>

        <h3>5.3 No Financial Advice</h3>
        <p>The Platform does not provide financial, investment, or legal advice. All transactions are at your own risk.</p>
      </div>

      <div class="section">
        <h2>6. Intellectual Property Rights</h2>
        
        <h3>6.1 Platform Rights</h3>
        <p>The Platform and its original content, features, and functionality are owned by portal.ask and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

        <h3>6.2 User Content</h3>
        <p>You retain ownership of content you post, but grant us a license to:</p>
        <ul>
          <li>Display and distribute your content on the Platform</li>
          <li>Use your content for Platform improvement</li>
          <li>Store and backup your content</li>
          <li>Share your content as required by law</li>
        </ul>

        <h3>6.3 License Terms</h3>
        <p>This license is worldwide, non-exclusive, royalty-free, and transferable. It terminates when you delete your content or account, except where your content has been shared with others.</p>
      </div>

      <div class="section">
        <h2>7. Privacy and Data Protection</h2>
        <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
        <p>By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.</p>
      </div>

      <div class="section">
        <h2>8. Disclaimers and Limitations</h2>
        
        <h3>8.1 Service Availability</h3>
        <p>We strive to maintain Platform availability but do not guarantee uninterrupted access. The Platform may be temporarily unavailable due to maintenance, updates, or technical issues.</p>

        <h3>8.2 Content Accuracy</h3>
        <p>We do not guarantee the accuracy, completeness, or usefulness of any content on the Platform. Users are responsible for verifying information and making their own decisions.</p>

        <h3>8.3 Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, portal.ask shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
        <ul>
          <li>Loss of profits, data, or use</li>
          <li>Business interruption</li>
          <li>Personal injury or property damage</li>
          <li>Emotional distress</li>
          <li>Any other damages arising from your use of the Platform</li>
        </ul>
      </div>

      <div class="section">
        <h2>9. Indemnification</h2>
        <p>You agree to defend, indemnify, and hold harmless portal.ask and its affiliates from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:</p>
        <ul>
          <li>Your use of the Platform</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Your content posted on the Platform</li>
        </ul>
      </div>

      <div class="section">
        <h2>10. Termination</h2>
        
        <h3>10.1 Termination by You</h3>
        <p>You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination:</p>
        <ul>
          <li>Your account will be deactivated</li>
          <li>Your public content may remain visible</li>
          <li>Blockchain transactions cannot be reversed</li>
          <li>Some data may be retained for legal compliance</li>
        </ul>

        <h3>10.2 Termination by Us</h3>
        <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Platform.</p>
      </div>

      <div class="section">
        <h2>11. Governing Law and Disputes</h2>
        
        <h3>11.1 Governing Law</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates, without regard to its conflict of law provisions.</p>

        <h3>11.2 Dispute Resolution</h3>
        <p>Any disputes arising from these Terms or your use of the Platform shall be resolved through:</p>
        <ul>
          <li>Good faith negotiations between parties</li>
          <li>Mediation if negotiations fail</li>
          <li>Binding arbitration as a last resort</li>
          <li>Court proceedings only if arbitration is not available</li>
        </ul>
      </div>

      <div class="section">
        <h2>12. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will notify users of material changes by:</p>
        <ul>
          <li>Posting updated Terms on the Platform</li>
          <li>Sending email notifications to registered users</li>
          <li>Displaying prominent notices on our website</li>
        </ul>
        <p>Your continued use of the Platform after changes become effective constitutes acceptance of the updated Terms.</p>
      </div>

      <div class="section">
        <h2>13. Severability</h2>
        <p>If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.</p>
      </div>

      <div class="section">
        <h2>14. Entire Agreement</h2>
        <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and portal.ask regarding your use of the Platform and supersede all prior agreements and understandings.</p>
      </div>

      <div class="section">
        <h2>15. Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us:</p>
        <div class="contact-info">
          <p><strong>Email:</strong> bountybucks524@gmail.com</p>
          <p><strong>Platform:</strong> portal.ask</p>
          <p>We will respond to your inquiry within a reasonable timeframe.</p>
        </div>
      </div>
    `,
      {
        format: "A4",
        margin: {
          top: "1in",
          right: "1in",
          bottom: "1in",
          left: "1in"
        }
      }
    );
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="portal-ask-terms-of-service.pdf"',
        "Content-Length": pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    return console.error("Error generating terms of service PDF:", error), json25({ error: "Failed to generate PDF" }, { status: 500 });
  }
};

// app/routes/docs.platform.tsx
var docs_platform_exports = {};
__export(docs_platform_exports, {
  default: () => PlatformDocsPage,
  loader: () => loader12
});
import { json as json26 } from "@remix-run/node";
import { useLoaderData as useLoaderData6, Link as Link6 } from "@remix-run/react";
import { FiArrowLeft as FiArrowLeft2, FiDownload as FiDownload2 } from "react-icons/fi";
import { jsx as jsx13, jsxs as jsxs10 } from "react/jsx-runtime";
var loader12 = async () => json26({
  title: "Platform Documentation",
  description: "Complete overview of portal.ask platform features, architecture, and functionality"
});
function PlatformDocsPage() {
  let data = useLoaderData6(), { title, description } = data;
  return /* @__PURE__ */ jsx13(Layout, { children: /* @__PURE__ */ jsxs10("div", { className: "w-auto max-w-6xl mx-auto mt-4 px-4 ml-24 pb-16", children: [
    /* @__PURE__ */ jsxs10("div", { className: "mb-8 mt-16", children: [
      /* @__PURE__ */ jsxs10(
        Link6,
        {
          to: "/docs",
          className: "inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors mb-4",
          children: [
            /* @__PURE__ */ jsx13(FiArrowLeft2, { className: "w-4 h-4 mr-2" }),
            "Back to Documentation"
          ]
        }
      ),
      /* @__PURE__ */ jsx13("h1", { className: "text-4xl font-bold text-white mb-4", children: title }),
      /* @__PURE__ */ jsx13("p", { className: "text-gray-400 text-lg max-w-3xl", children: description })
    ] }),
    /* @__PURE__ */ jsx13("div", { className: "prose prose-invert prose-violet max-w-none", children: /* @__PURE__ */ jsxs10("div", { className: "bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8", children: [
      /* @__PURE__ */ jsx13("h2", { children: "Overview" }),
      /* @__PURE__ */ jsx13("p", { children: "portal.ask is a decentralized knowledge-sharing platform built on the Solana blockchain. It combines traditional Q&A functionality with blockchain-powered bounties, reputation systems, and virtual currency to create an incentivized learning environment." }),
      /* @__PURE__ */ jsx13("h3", { children: "Key Concepts" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Knowledge Sharing" }),
          ": Users can ask questions, provide answers, and share insights"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Bounty System" }),
          ": Question creators can offer rewards for accepted answers"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Reputation System" }),
          ": Users earn reputation points for quality contributions"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Integrity System" }),
          ": Community-driven rating system to maintain quality"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Virtual Wallet" }),
          ": In-platform currency management for bounties and rewards"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "Technology Stack" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Frontend" }),
          ": React 18, Remix 2.8, TypeScript"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Backend" }),
          ": Node.js, Express"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Database" }),
          ": Cloudflare D1 with Drizzle ORM"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Blockchain" }),
          ": Solana (Web3.js, Anchor Framework)"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Styling" }),
          ": Tailwind CSS"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Media" }),
          ": Cloudinary for file uploads"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "PDF Generation" }),
          ": Puppeteer"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h2", { children: "Features" }),
      /* @__PURE__ */ jsx13("h3", { children: "1. User Authentication & Profiles" }),
      /* @__PURE__ */ jsx13("h4", { children: "Registration & Login" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Email-based authentication" }),
        /* @__PURE__ */ jsx13("li", { children: "Username uniqueness validation" }),
        /* @__PURE__ */ jsx13("li", { children: "Password security with bcrypt" }),
        /* @__PURE__ */ jsx13("li", { children: "Session management with JWT" })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Profile Management" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Customizable profile pictures" }),
        /* @__PURE__ */ jsx13("li", { children: "Bio and personal information" }),
        /* @__PURE__ */ jsx13("li", { children: "Social media links" }),
        /* @__PURE__ */ jsx13("li", { children: "Reputation score display" }),
        /* @__PURE__ */ jsx13("li", { children: "Activity history" })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "2. Content Creation & Management" }),
      /* @__PURE__ */ jsx13("h4", { children: "Posts (Questions)" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Rich text editor with markdown support" }),
        /* @__PURE__ */ jsx13("li", { children: "Code block syntax highlighting" }),
        /* @__PURE__ */ jsx13("li", { children: "Media uploads (images, videos, screen recordings)" }),
        /* @__PURE__ */ jsx13("li", { children: "Tags and categorization" }),
        /* @__PURE__ */ jsx13("li", { children: "Draft saving and editing" })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Answers" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Rich text responses" }),
        /* @__PURE__ */ jsx13("li", { children: "Code examples with syntax highlighting" }),
        /* @__PURE__ */ jsx13("li", { children: "Media attachments" }),
        /* @__PURE__ */ jsx13("li", { children: "Voting system" }),
        /* @__PURE__ */ jsx13("li", { children: "Acceptance by question author" })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "3. Bounty System" }),
      /* @__PURE__ */ jsx13("h4", { children: "Creating Bounties" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Attach rewards to questions" }),
        /* @__PURE__ */ jsx13("li", { children: "Set bounty amounts in PORTAL tokens" }),
        /* @__PURE__ */ jsx13("li", { children: "Optional expiration dates" }),
        /* @__PURE__ */ jsx13("li", { children: "Automatic escrow of funds" }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "5% governance fee" }),
          " for community rewards"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Claiming Bounties" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Question author accepts answers" }),
        /* @__PURE__ */ jsx13("li", { children: "Automatic payout to answer author" }),
        /* @__PURE__ */ jsx13("li", { children: "Transaction history tracking" }),
        /* @__PURE__ */ jsx13("li", { children: "Dispute resolution system" })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Refund System" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Time-based restrictions" }),
          ": 24-hour lock period after first answer"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Community approval" }),
          ": All refunds require community voting"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Governance rewards" }),
          ": 5% of bounty amount distributed to voters"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Penalty system" }),
          ": 20% penalty for refunding with helpful answers"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Integrity impact" }),
          ": Refunding with helpful answers reduces integrity score"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Refund Process" }),
      /* @__PURE__ */ jsxs10("ol", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Request Creation" }),
          ": User submits refund request with reason"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Time Validation" }),
          ": System checks if 24 hours have passed since first answer"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Community Voting" }),
          ": 48-hour voting window with minimum vote requirements"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Approval Criteria" }),
          ": 60% approval rate with minimum votes (3-7 depending on answers)"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Processing" }),
          ": If approved, refund minus penalties distributed"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Rewards" }),
          ": Governance participants receive tokens and reputation points"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Governance Participation" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Voting Rewards" }),
          ": Earn tokens proportional to bounty amount"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Reputation Points" }),
          ": +5 points for each governance participation"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Vote Requirements" }),
          ": Cannot vote on own requests or multiple times"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Transparency" }),
          ": All votes and reasons are publicly visible"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "4. Reputation System" }),
      /* @__PURE__ */ jsx13("h4", { children: "Earning Points" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Post Creation" }),
          ": +10 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Answer Creation" }),
          ": +5 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Answer Acceptance" }),
          ": +15 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Upvotes Received" }),
          ": +2 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Downvotes Received" }),
          ": -1 point"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Quality Upvotes" }),
          ": +5 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Quality Downvotes" }),
          ": -2 points"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Reputation Levels" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Beginner" }),
          ": 0-99 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Contributor" }),
          ": 100-499 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Expert" }),
          ": 500-999 points"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Master" }),
          ": 1000+ points"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "5. Integrity System" }),
      /* @__PURE__ */ jsx13("h4", { children: "User Ratings" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "1-10 rating scale" }),
        /* @__PURE__ */ jsx13("li", { children: "Context-based ratings" }),
        /* @__PURE__ */ jsxs10("li", { children: [
          "Rating categories:",
          /* @__PURE__ */ jsxs10("ul", { children: [
            /* @__PURE__ */ jsx13("li", { children: "Bounty Rejection" }),
            /* @__PURE__ */ jsx13("li", { children: "Answer Quality" }),
            /* @__PURE__ */ jsx13("li", { children: "Communication" }),
            /* @__PURE__ */ jsx13("li", { children: "Spam" }),
            /* @__PURE__ */ jsx13("li", { children: "Harassment" }),
            /* @__PURE__ */ jsx13("li", { children: "General Behavior" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "6. Virtual Wallet System" }),
      /* @__PURE__ */ jsx13("h4", { children: "Wallet Features" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Virtual balance tracking" }),
        /* @__PURE__ */ jsx13("li", { children: "Transaction history" }),
        /* @__PURE__ */ jsx13("li", { children: "Deposit/withdrawal capabilities" }),
        /* @__PURE__ */ jsx13("li", { children: "Bounty management" }),
        /* @__PURE__ */ jsx13("li", { children: "Earnings tracking" })
      ] }),
      /* @__PURE__ */ jsx13("h4", { children: "Transaction Types" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "DEPOSIT" }),
          ": Add funds to wallet"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "WITHDRAWAL" }),
          ": Remove funds from wallet"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "BOUNTY_CREATED" }),
          ": Create new bounty"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "BOUNTY_CLAIMED" }),
          ": Win bounty reward"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "BOUNTY_REFUNDED" }),
          ": Get bounty refund"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "COMPENSATION" }),
          ": Receive governance rewards or penalty distributions"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "7. Voting System" }),
      /* @__PURE__ */ jsx13("h4", { children: "Content Voting" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Upvote/downvote posts" }),
        /* @__PURE__ */ jsx13("li", { children: "Upvote/downvote answers" }),
        /* @__PURE__ */ jsx13("li", { children: "Upvote/downvote comments" }),
        /* @__PURE__ */ jsx13("li", { children: "Quality voting for posts" })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "8. Media Management" }),
      /* @__PURE__ */ jsx13("h4", { children: "Upload Support" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Images (JPG, PNG, GIF)" }),
        /* @__PURE__ */ jsx13("li", { children: "Videos (MP4, WebM)" }),
        /* @__PURE__ */ jsx13("li", { children: "Screen recordings" }),
        /* @__PURE__ */ jsx13("li", { children: "File size limits" }),
        /* @__PURE__ */ jsx13("li", { children: "Format validation" })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "9. Search & Discovery" }),
      /* @__PURE__ */ jsx13("h4", { children: "Content Discovery" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Community feed" }),
        /* @__PURE__ */ jsx13("li", { children: "Trending posts" }),
        /* @__PURE__ */ jsx13("li", { children: "Bounty highlights" }),
        /* @__PURE__ */ jsx13("li", { children: "User activity feeds" }),
        /* @__PURE__ */ jsx13("li", { children: "Tag-based filtering" })
      ] }),
      /* @__PURE__ */ jsx13("h2", { children: "Architecture" }),
      /* @__PURE__ */ jsx13("h3", { children: "System Components" }),
      /* @__PURE__ */ jsx13("pre", { className: "bg-neutral-900 p-4 rounded-lg text-sm overflow-x-auto", children: `\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   Frontend      \u2502    \u2502   Backend       \u2502    \u2502   Blockchain    \u2502
\u2502   (Remix/React) \u2502\u25C4\u2500\u2500\u25BA\u2502   (Node.js)     \u2502\u25C4\u2500\u2500\u25BA\u2502   (Solana)      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
         \u2502                       \u2502                       \u2502
         \u2502                       \u2502                       \u2502
         \u25BC                       \u25BC                       \u25BC
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   Cloudinary    \u2502    \u2502   MongoDB       \u2502    \u2502   Virtual       \u2502
\u2502   (Media)       \u2502    \u2502   (Database)    \u2502    \u2502   Wallet        \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518` }),
      /* @__PURE__ */ jsx13("h3", { children: "Key Design Principles" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Server-Side Rendering" }),
          ": Remix provides SSR for better SEO and performance"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Type Safety" }),
          ": TypeScript throughout the application"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Component-Based" }),
          ": Reusable React components"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "API-First" }),
          ": RESTful API design"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Blockchain-Native" }),
          ": Solana integration for decentralized features"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Scalable" }),
          ": Modular architecture for easy extension"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h2", { children: "Support & Resources" }),
      /* @__PURE__ */ jsx13("h3", { children: "Documentation" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("a", { href: "/docs/user-guide", className: "text-violet-400 hover:text-violet-300", children: "User Guide" }),
          " - Complete user documentation"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("a", { href: "/docs/developer-guide", className: "text-violet-400 hover:text-violet-300", children: "Developer Guide" }),
          " - Technical documentation"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("a", { href: "/docs/api-reference", className: "text-violet-400 hover:text-violet-300", children: "API Reference" }),
          " - API documentation"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("a", { href: "/docs/deployment-guide", className: "text-violet-400 hover:text-violet-300", children: "Deployment Guide" }),
          " - Production deployment"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "Community" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("a", { href: "https://discord.gg/zvB9gwhq", target: "_blank", rel: "noopener noreferrer", className: "text-violet-400 hover:text-violet-300", children: "Discord Server" }),
          " - Join our community"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("a", { href: "https://github.com/portal", target: "_blank", rel: "noopener noreferrer", className: "text-violet-400 hover:text-violet-300", children: "GitHub Repository" }),
          " - Source code"
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("a", { href: "https://x.com/portal_ask", target: "_blank", rel: "noopener noreferrer", className: "text-violet-400 hover:text-violet-300", children: "X (Twitter)" }),
          " - Latest updates"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "Contact" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Email" }),
          ": ",
          /* @__PURE__ */ jsx13("a", { href: "mailto:bountybucks524@gmail.com", className: "text-violet-400 hover:text-violet-300", children: "bountybucks524@gmail.com" })
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Platform" }),
          ": ",
          /* @__PURE__ */ jsx13("a", { href: "https://portal.ask", className: "text-violet-400 hover:text-violet-300", children: "portal.ask" })
        ] }),
        /* @__PURE__ */ jsxs10("li", { children: [
          /* @__PURE__ */ jsx13("strong", { children: "Support" }),
          ": Available through Discord and email"
        ] })
      ] }),
      /* @__PURE__ */ jsx13("h2", { children: "Version History" }),
      /* @__PURE__ */ jsx13("h3", { children: "v1.0.0 (Current)" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Initial platform release" }),
        /* @__PURE__ */ jsx13("li", { children: "Core Q&A functionality" }),
        /* @__PURE__ */ jsx13("li", { children: "Bounty system with 5% governance fee" }),
        /* @__PURE__ */ jsx13("li", { children: "Time-based refund restrictions (24-hour lock period)" }),
        /* @__PURE__ */ jsx13("li", { children: "Community governance system for refund approval" }),
        /* @__PURE__ */ jsx13("li", { children: "Reputation and integrity systems" }),
        /* @__PURE__ */ jsx13("li", { children: "Virtual wallet with governance rewards" }),
        /* @__PURE__ */ jsx13("li", { children: "Media uploads" }),
        /* @__PURE__ */ jsx13("li", { children: "PDF generation for legal documents" })
      ] }),
      /* @__PURE__ */ jsx13("h3", { children: "Planned Features" }),
      /* @__PURE__ */ jsxs10("ul", { children: [
        /* @__PURE__ */ jsx13("li", { children: "Mobile application" }),
        /* @__PURE__ */ jsx13("li", { children: "Advanced search functionality" }),
        /* @__PURE__ */ jsx13("li", { children: "AI-powered content moderation" }),
        /* @__PURE__ */ jsx13("li", { children: "Multi-language support" }),
        /* @__PURE__ */ jsx13("li", { children: "Advanced analytics dashboard" }),
        /* @__PURE__ */ jsx13("li", { children: "Community governance tools" })
      ] }),
      /* @__PURE__ */ jsxs10("div", { className: "mt-8 p-6 bg-violet-500/10 rounded-lg border border-violet-500/30", children: [
        /* @__PURE__ */ jsx13("h3", { className: "text-violet-300 mb-4", children: "Download Full Documentation" }),
        /* @__PURE__ */ jsx13("p", { className: "text-gray-400 mb-4", children: "Get the complete platform documentation as a PDF for offline reading." }),
        /* @__PURE__ */ jsxs10(
          "a",
          {
            href: "/api/docs/platform.pdf",
            className: "inline-flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors",
            children: [
              /* @__PURE__ */ jsx13(FiDownload2, { className: "w-4 h-4 mr-2" }),
              "Download PDF"
            ]
          }
        )
      ] })
    ] }) })
  ] }) });
}

// app/routes/posts.$postId.tsx
var posts_postId_exports = {};
__export(posts_postId_exports, {
  ErrorBoundary: () => ErrorBoundary2,
  action: () => action19,
  default: () => PostDetail,
  loader: () => loader13,
  meta: () => meta
});
import { useEffect as useEffect6, useState as useState8 } from "react";
import { useLoaderData as useLoaderData7, useSubmit as useSubmit2, useFetcher as useFetcher2, Form as Form4, useRouteError as useRouteError2, isRouteErrorResponse as isRouteErrorResponse2, Link as Link7, useActionData as useActionData3 } from "@remix-run/react";
import { json as json27, redirect as redirect2 } from "@remix-run/node";
init_schema();
import { eq as eq20, and as and15, desc as desc8, sql as sql8 } from "drizzle-orm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiTrash2 as FiTrash22, FiArrowUp, FiArrowDown } from "react-icons/fi";

// app/components/IntegrityRatingButton.tsx
import { useState as useState7 } from "react";
import { FiShield as FiShield2, FiStar as FiStar2 } from "react-icons/fi";

// app/components/IntegrityRatingModal.tsx
import { useState as useState6, useEffect as useEffect5 } from "react";
import { useFetcher } from "@remix-run/react";
import { FiStar, FiX, FiAlertCircle } from "react-icons/fi";
import { jsx as jsx14, jsxs as jsxs11 } from "react/jsx-runtime";
var RATING_CONTEXTS = [
  {
    value: "BOUNTY_REJECTION",
    label: "Bounty Rejection",
    description: "User rejected a valid answer to their bounty question"
  },
  {
    value: "ANSWER_QUALITY",
    label: "Answer Quality",
    description: "User provided poor quality or incorrect answers"
  },
  {
    value: "COMMUNICATION",
    label: "Communication",
    description: "User was unresponsive or difficult to communicate with"
  },
  {
    value: "SPAM",
    label: "Spam",
    description: "User posted spam or irrelevant content"
  },
  {
    value: "HARASSMENT",
    label: "Harassment",
    description: "User engaged in harassing behavior"
  },
  {
    value: "GENERAL",
    label: "General Behavior",
    description: "General behavior or conduct issues"
  }
];
function IntegrityRatingModal({
  isOpen,
  onClose,
  targetUser,
  context = "GENERAL",
  referenceId,
  referenceType
}) {
  let [rating, setRating] = useState6(5), [selectedContext, setSelectedContext] = useState6(context), [reason, setReason] = useState6(""), [hoveredRating, setHoveredRating] = useState6(0), fetcher = useFetcher(), isSubmitting = fetcher.state === "submitting";
  useEffect5(() => {
    fetcher.data?.success && (onClose(), setRating(5), setReason(""), setSelectedContext(context));
  }, [fetcher.data, onClose, context]);
  let handleSubmit = (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("ratedUserId", targetUser.id), formData.append("rating", rating.toString()), formData.append("reason", reason), formData.append("context", selectedContext), referenceId && formData.append("referenceId", referenceId), referenceType && formData.append("referenceType", referenceType), fetcher.submit(formData, {
      method: "post",
      action: "/api/integrity/rate"
    });
  };
  return isOpen ? /* @__PURE__ */ jsx14("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs11("div", { className: "bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4 border-2 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]", children: [
    /* @__PURE__ */ jsxs11("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx14("h2", { className: "text-xl font-semibold text-white", children: "Rate User Integrity" }),
      /* @__PURE__ */ jsx14(
        "button",
        {
          onClick: onClose,
          className: "text-gray-400 hover:text-white transition-colors",
          children: /* @__PURE__ */ jsx14(FiX, { className: "w-6 h-6" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx14("div", { className: "mb-4", children: /* @__PURE__ */ jsxs11("p", { className: "text-gray-300", children: [
      "Rating ",
      /* @__PURE__ */ jsx14("span", { className: "text-violet-400 font-semibold", children: targetUser.username })
    ] }) }),
    /* @__PURE__ */ jsxs11(fetcher.Form, { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs11("div", { children: [
        /* @__PURE__ */ jsx14("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Integrity Rating (1-10)" }),
        /* @__PURE__ */ jsx14("div", { className: "flex items-center space-x-1", children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => /* @__PURE__ */ jsx14(
          "button",
          {
            type: "button",
            onClick: () => setRating(star),
            onMouseEnter: () => setHoveredRating(star),
            onMouseLeave: () => setHoveredRating(0),
            className: `p-1 transition-colors ${star <= (hoveredRating || rating) ? "text-yellow-400" : "text-gray-400"}`,
            children: /* @__PURE__ */ jsx14(FiStar, { className: "w-6 h-6 fill-current" })
          },
          star
        )) }),
        /* @__PURE__ */ jsxs11("p", { className: "text-sm text-gray-400 mt-1", children: [
          rating,
          "/10 - ",
          getRatingDescription(rating)
        ] })
      ] }),
      /* @__PURE__ */ jsxs11("div", { children: [
        /* @__PURE__ */ jsx14("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Rating Context" }),
        /* @__PURE__ */ jsx14(
          "select",
          {
            value: selectedContext,
            onChange: (e) => setSelectedContext(e.target.value),
            className: "w-full bg-neutral-700 border border-violet-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500",
            children: RATING_CONTEXTS.map((ctx) => /* @__PURE__ */ jsx14("option", { value: ctx.value, children: ctx.label }, ctx.value))
          }
        ),
        /* @__PURE__ */ jsx14("p", { className: "text-xs text-gray-400 mt-1", children: RATING_CONTEXTS.find((c) => c.value === selectedContext)?.description })
      ] }),
      /* @__PURE__ */ jsxs11("div", { children: [
        /* @__PURE__ */ jsx14("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Reason for Rating" }),
        /* @__PURE__ */ jsx14(
          "textarea",
          {
            value: reason,
            onChange: (e) => setReason(e.target.value),
            placeholder: "Explain why you're giving this rating...",
            className: "w-full bg-neutral-700 border border-violet-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500 resize-none",
            rows: 3,
            maxLength: 500,
            required: !0
          }
        ),
        /* @__PURE__ */ jsxs11("p", { className: "text-xs text-gray-400 mt-1", children: [
          reason.length,
          "/500 characters"
        ] })
      ] }),
      fetcher.data?.error && /* @__PURE__ */ jsxs11("div", { className: "flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg", children: [
        /* @__PURE__ */ jsx14(FiAlertCircle, { className: "w-5 h-5 text-red-400 flex-shrink-0" }),
        /* @__PURE__ */ jsx14("p", { className: "text-red-400 text-sm", children: fetcher.data.error })
      ] }),
      /* @__PURE__ */ jsxs11("div", { className: "flex space-x-3 pt-4", children: [
        /* @__PURE__ */ jsx14(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors border border-neutral-600",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx14(
          "button",
          {
            type: "submit",
            disabled: isSubmitting || !reason.trim(),
            className: "flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]",
            children: isSubmitting ? "Submitting..." : "Submit Rating"
          }
        )
      ] })
    ] })
  ] }) }) : null;
}
function getRatingDescription(rating) {
  return rating >= 9 ? "Exceptional integrity" : rating >= 8 ? "Excellent integrity" : rating >= 7 ? "Good integrity" : rating >= 6 ? "Fair integrity" : rating >= 5 ? "Average integrity" : rating >= 4 ? "Below average integrity" : rating >= 3 ? "Poor integrity" : rating >= 2 ? "Very poor integrity" : "Unacceptable integrity";
}

// app/components/IntegrityRatingButton.tsx
import { Fragment as Fragment3, jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
function IntegrityRatingButton({
  targetUser,
  context,
  referenceId,
  referenceType,
  className = "",
  variant = "button"
}) {
  let [showModal, setShowModal] = useState7(!1), getContextDescription = (context2) => ({
    BOUNTY_REJECTION: "Rate bounty rejection",
    ANSWER_QUALITY: "Rate answer quality",
    COMMUNICATION: "Rate communication",
    SPAM: "Rate spam behavior",
    HARASSMENT: "Rate harassment",
    GENERAL: "Rate general behavior"
  })[context2] || "Rate user";
  return /* @__PURE__ */ jsxs12(Fragment3, { children: [
    (() => {
      switch (variant) {
        case "icon":
          return /* @__PURE__ */ jsx15(
            "button",
            {
              onClick: () => setShowModal(!0),
              className: `p-2 text-gray-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-violet-500/10 ${className}`,
              title: getContextDescription(context),
              children: /* @__PURE__ */ jsx15(FiShield2, { className: "w-4 h-4" })
            }
          );
        case "badge":
          return /* @__PURE__ */ jsxs12(
            "button",
            {
              onClick: () => setShowModal(!0),
              className: `inline-flex items-center gap-1 px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30 hover:bg-violet-500/30 transition-colors ${className}`,
              title: getContextDescription(context),
              children: [
                /* @__PURE__ */ jsx15(FiStar2, { className: "w-3 h-3" }),
                "Rate"
              ]
            }
          );
        default:
          return /* @__PURE__ */ jsxs12(
            "button",
            {
              onClick: () => setShowModal(!0),
              className: `inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)] ${className}`,
              children: [
                /* @__PURE__ */ jsx15(FiShield2, { className: "w-4 h-4" }),
                "Rate Integrity"
              ]
            }
          );
      }
    })(),
    /* @__PURE__ */ jsx15(
      IntegrityRatingModal,
      {
        isOpen: showModal,
        onClose: () => setShowModal(!1),
        targetUser,
        context,
        referenceId,
        referenceType
      }
    )
  ] });
}

// app/routes/posts.$postId.tsx
import { jsx as jsx16, jsxs as jsxs13 } from "react/jsx-runtime";
var DEFAULT_PROFILE_PICTURE = "https://api.dicebear.com/7.x/initials/svg?seed=";
function getProfilePicture(profilePicture, username) {
  return profilePicture || `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
}
var meta = ({ data }) => {
  let postTitle = data?.post?.title || "Post";
  return [
    { title: `${postTitle} - portal.ask` },
    { name: "description", content: postTitle }
  ];
}, loader13 = async ({ request, params, context }) => {
  try {
    let db = createDb(context.env.DB), user = await getUser(request, db), { postId } = params, url = new URL(request.url), page = parseInt(url.searchParams.get("page") || "1"), perPage = 10;
    if (!postId)
      throw new Response("Post ID is required", { status: 400 });
    let post = await db.query.posts.findFirst({
      where: eq20(posts.id, postId),
      with: {
        author: {
          columns: {
            id: !0,
            username: !0
          },
          with: {
            profile: {
              columns: {
                profilePicture: !0
              }
            }
          }
        },
        media: !0,
        comments: {
          orderBy: [desc8(comments.upvotes), desc8(comments.createdAt)],
          limit: perPage,
          offset: (page - 1) * perPage,
          with: {
            author: {
              columns: {
                id: !0,
                username: !0
              },
              with: {
                profile: {
                  columns: {
                    profilePicture: !0
                  }
                }
              }
            }
          }
        },
        answers: {
          orderBy: [desc8(answers.isAccepted), desc8(answers.upvotes), desc8(answers.createdAt)],
          with: {
            author: {
              columns: {
                id: !0,
                username: !0
              },
              with: {
                profile: {
                  columns: {
                    profilePicture: !0
                  }
                }
              }
            }
          }
        },
        codeBlocks: !0,
        votes: user ? {
          where: and15(eq20(votes.userId, user.id), eq20(votes.isQualityVote, !0))
        } : void 0,
        bounty: !0
      }
    });
    if (!post)
      throw new Response("Post not found", { status: 404 });
    let userVotes = user ? await db.query.votes.findMany({
      where: and15(eq20(votes.userId, user.id), eq20(votes.postId, postId))
    }) : [], allVotes = await db.query.votes.findMany({
      where: and15(eq20(votes.postId, postId), eq20(votes.voteType, "POST"), eq20(votes.isQualityVote, !0))
    }), qualityUpvotes = allVotes.filter((v) => v.value === 1).length, qualityDownvotes = allVotes.filter((v) => v.value === -1).length, userQualityVote = userVotes.find((v) => v.isQualityVote)?.value || 0, userVisibilityVote = userVotes.find((v) => !v.isQualityVote)?.value || 0, totalComments = (await db.query.comments.findMany({ where: eq20(comments.postId, postId) })).length, totalAnswers = (await db.query.answers.findMany({ where: eq20(answers.postId, postId) })).length, commentIds = post?.comments?.map((c) => c.id) || [], answerIds = post?.answers?.map((a) => a.id) || [], commentVotes = [], answerVotes = [];
    user && (commentIds.length > 0 && (commentVotes = (await db.query.votes.findMany({
      where: and15(eq20(votes.userId, user.id), eq20(votes.voteType, "COMMENT"), eq20(votes.isQualityVote, !0))
    })).filter((v) => commentIds.includes(v.commentId)).map((v) => ({ commentId: v.commentId, value: v.value }))), answerIds.length > 0 && (answerVotes = (await db.query.votes.findMany({
      where: and15(eq20(votes.userId, user.id), eq20(votes.voteType, "ANSWER"), eq20(votes.isQualityVote, !0))
    })).filter((v) => answerIds.includes(v.answerId)).map((v) => ({ answerId: v.answerId, value: v.value }))));
    let transformedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      visibilityVotes: post.visibilityVotes ?? 0,
      qualityUpvotes,
      qualityDownvotes,
      userQualityVote,
      userVisibilityVote,
      hasBounty: post.hasBounty ?? !1,
      status: post.status,
      author: {
        id: post.author.id,
        username: post.author.username,
        profilePicture: post.author.profile?.profilePicture || null,
        profile: post.author.profile ? {
          profilePicture: post.author.profile.profilePicture
        } : null
      },
      comments: (post.comments || []).map((comment) => ({
        ...comment,
        createdAt: comment.createdAt?.toISOString?.() ?? "",
        updatedAt: comment.updatedAt?.toISOString?.() ?? "",
        userVote: commentVotes.find((v) => v.commentId === comment.id)?.value || 0,
        author: {
          id: comment.author.id,
          username: comment.author.username,
          profilePicture: comment.author.profile?.profilePicture || null,
          profile: comment.author.profile ? {
            profilePicture: comment.author.profile.profilePicture
          } : null
        }
      })),
      answers: (post.answers || []).map((answer) => ({
        ...answer,
        createdAt: answer.createdAt?.toISOString?.() ?? "",
        updatedAt: answer.updatedAt?.toISOString?.() ?? "",
        userVote: answerVotes.find((v) => v.answerId === answer.id)?.value || 0,
        author: {
          id: answer.author.id,
          username: answer.author.username,
          profilePicture: answer.author.profile?.profilePicture || null,
          profile: answer.author.profile ? {
            profilePicture: answer.author.profile.profilePicture
          } : null
        }
      })),
      codeBlocks: (post.codeBlocks || []).map((cb) => ({ ...cb })),
      media: (post.media || []).map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || void 0,
        isScreenRecording: m.isScreenRecording ?? !1
      })),
      bounty: post.bounty ? {
        amount: post.bounty.amount?.toString?.() ?? "",
        tokenSymbol: "SOL",
        // Default to SOL since we don't store token symbol
        expiresAt: post.bounty.expiresAt?.toISOString?.() || "",
        status: post.bounty.status
      } : null
    };
    return json27({
      post: transformedPost,
      currentUser: user,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / perPage),
        totalComments,
        totalAnswers
      }
    });
  } catch {
    throw new Response("Failed to load post", { status: 500 });
  }
}, action19 = async ({ request, params, context }) => {
  let db = createDb(context.env.DB), user = await getUser(request, db);
  if (!user)
    return json27({ error: "Not authenticated" }, { status: 401 });
  let postId = params.postId;
  if (!postId)
    return json27({ error: "Post ID is required" }, { status: 400 });
  let formData = await request.formData();
  switch (formData.get("action")) {
    case "deletePost": {
      let post = await db.query.posts.findFirst({
        where: eq20(posts.id, postId)
      });
      return post ? post.authorId !== user.id ? json27({ error: "You can only delete your own posts" }, { status: 403 }) : (await db.delete(posts).where(eq20(posts.id, postId)), redirect2("/community")) : json27({ error: "Post not found" }, { status: 404 });
    }
    case "qualityVote": {
      let value = parseInt(formData.get("value"));
      return [-1, 0, 1].includes(value) ? await db.transaction(async () => {
        await db.delete(votes).where(and15(eq20(votes.userId, user.id), eq20(votes.postId, postId), eq20(votes.voteType, "POST"), eq20(votes.isQualityVote, !0))), value !== 0 && await db.insert(votes).values({
          id: crypto.randomUUID(),
          userId: user.id,
          postId,
          value,
          voteType: "POST",
          isQualityVote: !0,
          commentId: null,
          answerId: null
        });
        let allVotes = await db.query.votes.findMany({
          where: and15(eq20(votes.postId, postId), eq20(votes.voteType, "POST"), eq20(votes.isQualityVote, !0))
        }), qualityUpvotes = allVotes.filter((v) => v.value === 1).length, qualityDownvotes = allVotes.filter((v) => v.value === -1).length;
        return await db.update(posts).set({
          qualityUpvotes,
          qualityDownvotes
        }).where(eq20(posts.id, postId)), json27({
          success: !0,
          qualityUpvotes,
          qualityDownvotes,
          userQualityVote: value
        });
      }) : json27({ error: "Invalid vote value" }, { status: 400 });
    }
    case "visibilityVote": {
      let isVoting = formData.get("isVoting") === "true", result = await db.transaction(async () => {
        let existingVote = await db.select().from(votes).where(and15(eq20(votes.userId, user.id), eq20(votes.postId, postId), eq20(votes.voteType, "POST"), eq20(votes.isQualityVote, !1))).limit(1);
        isVoting ? existingVote.length || await db.insert(votes).values({
          id: crypto.randomUUID(),
          userId: user.id,
          postId,
          value: 1,
          // Always 1 for visibility votes
          voteType: "POST",
          isQualityVote: !1,
          commentId: null,
          answerId: null
        }) : existingVote.length && await db.delete(votes).where(eq20(votes.id, existingVote[0].id));
        let visibilityVotesResult = await db.select({ count: sql8`count(*)` }).from(votes).where(and15(eq20(votes.postId, postId), eq20(votes.voteType, "POST"), eq20(votes.isQualityVote, !1), eq20(votes.value, 1)));
        return {
          post: (await db.update(posts).set({
            visibilityVotes: visibilityVotesResult[0]?.count || 0
          }).where(eq20(posts.id, postId)).returning())[0],
          userVisibilityVote: isVoting
        };
      });
      return json27({
        success: !0,
        visibilityVotes: result.post.visibilityVotes,
        userVisibilityVote: result.userVisibilityVote
      });
    }
    case "comment": {
      let content = formData.get("content");
      if (!content)
        return json27({ error: "Comment content is required" }, { status: 400 });
      if (!params.postId)
        return json27({ error: "Post ID is required" }, { status: 400 });
      let commentId = crypto.randomUUID();
      await db.insert(comments).values({
        id: commentId,
        content,
        authorId: user.id,
        postId: params.postId,
        upvotes: 0,
        downvotes: 0,
        answerId: null
      });
      let author = await db.select().from(users).where(eq20(users.id, user.id)).limit(1), profile = await db.select().from(profiles).where(eq20(profiles.userId, user.id)).limit(1);
      return await addReputationPoints(
        db,
        user.id,
        REPUTATION_POINTS.COMMENT_CREATED,
        "COMMENT_CREATED",
        commentId
      ), json27({
        success: !0,
        comment: {
          id: commentId,
          content,
          author: {
            id: author[0]?.id,
            username: author[0]?.username,
            profilePicture: profile[0]?.profilePicture || null,
            profile: profile[0] ? { profilePicture: profile[0].profilePicture } : null
          },
          upvotes: 0,
          downvotes: 0,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          userVote: 0
        }
      });
    }
    case "answer": {
      let content = formData.get("content");
      if (!content)
        return json27({ error: "Answer content is required" }, { status: 400 });
      if (!params.postId)
        return json27({ error: "Post ID is required" }, { status: 400 });
      let answerId = crypto.randomUUID();
      await db.insert(answers).values({
        id: answerId,
        content,
        postId: params.postId,
        authorId: user.id,
        isAccepted: !1,
        upvotes: 0,
        downvotes: 0
      });
      let author = await db.select().from(users).where(eq20(users.id, user.id)).limit(1), profile = await db.select().from(profiles).where(eq20(profiles.userId, user.id)).limit(1);
      return await addReputationPoints(
        db,
        user.id,
        REPUTATION_POINTS.ANSWER_CREATED,
        "ANSWER_CREATED",
        answerId
      ), json27({
        success: !0,
        answer: {
          id: answerId,
          content,
          author: {
            id: author[0]?.id,
            username: author[0]?.username,
            profilePicture: profile[0]?.profilePicture || null,
            profile: profile[0] ? { profilePicture: profile[0].profilePicture } : null
          },
          upvotes: 0,
          downvotes: 0,
          isAccepted: !1,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          userVote: 0
        }
      });
    }
    case "acceptAnswer": {
      let answerId = formData.get("answerId");
      if (!answerId)
        return json27({ error: "Answer ID is required" }, { status: 400 });
      let answer = await db.query.answers.findFirst({
        where: eq20(answers.id, answerId),
        with: {
          author: {
            columns: {
              id: !0,
              username: !0
            }
          }
        }
      });
      if (!answer)
        return json27({ error: "Answer not found" }, { status: 404 });
      let post = await db.query.posts.findFirst({
        where: eq20(posts.id, answer.postId),
        with: {
          bounty: !0
        }
      });
      return post ? post.authorId !== user.id ? json27({ error: "Only the post author can accept answers" }, { status: 403 }) : post.bounty ? post.bounty.status !== "ACTIVE" ? json27({ error: "Bounty is not active" }, { status: 400 }) : await db.transaction(async () => {
        await db.update(answers).set({ isAccepted: !0 }).where(eq20(answers.id, answerId)), await db.update(posts).set({ status: "COMPLETED" }).where(eq20(posts.id, answer.postId)), await db.update(bounties).set({
          status: "CLAIMED",
          winnerId: answer.authorId
        }).where(eq20(bounties.postId, answer.postId));
        let { claimBounty: claimBounty2 } = await Promise.resolve().then(() => (init_virtual_wallet_server(), virtual_wallet_server_exports)), bountyAmount = post.bounty.amount;
        return await claimBounty2(
          db,
          answer.authorId,
          bountyAmount,
          post.bounty.id
        ), json27({
          success: !0,
          message: `Bounty of ${bountyAmount} BBUX transferred to ${answer.author.username}`,
          answer: {
            ...answer,
            isAccepted: !0
          }
        });
      }) : json27({ error: "No bounty found for this post" }, { status: 404 }) : json27({ error: "Post not found" }, { status: 404 });
    }
    case "commentVote": {
      let commentId = formData.get("commentId"), value = parseInt(formData.get("value"));
      if (!commentId || ![-1, 0, 1].includes(value))
        return json27({ error: "Invalid parameters" }, { status: 400 });
      let maxRetries = 3, retryCount = 0;
      for (; retryCount < maxRetries; )
        try {
          return await db.transaction(async () => {
            await db.delete(votes).where(and15(eq20(votes.userId, user.id), eq20(votes.commentId, commentId), eq20(votes.voteType, "COMMENT"), eq20(votes.isQualityVote, !0))), value !== 0 && await db.insert(votes).values({
              id: crypto.randomUUID(),
              userId: user.id,
              commentId,
              value,
              voteType: "COMMENT",
              isQualityVote: !0,
              postId: null,
              answerId: null
            });
            let [upvotesResult, downvotesResult] = await Promise.all([
              db.select({ count: sql8`count(*)` }).from(votes).where(and15(eq20(votes.commentId, commentId), eq20(votes.voteType, "COMMENT"), eq20(votes.isQualityVote, !0), eq20(votes.value, 1))),
              db.select({ count: sql8`count(*)` }).from(votes).where(and15(eq20(votes.commentId, commentId), eq20(votes.voteType, "COMMENT"), eq20(votes.isQualityVote, !0), eq20(votes.value, -1)))
            ]);
            return await db.update(comments).set({
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0
            }).where(eq20(comments.id, commentId)), json27({
              success: !0,
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0,
              userVote: value
            });
          });
        } catch (error) {
          if (retryCount++, error.code === "P2034" && retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
            continue;
          }
          throw error;
        }
      return json27({ error: "Vote operation failed after retries" }, { status: 500 });
    }
    case "answerVote": {
      let answerId = formData.get("answerId"), value = parseInt(formData.get("value"));
      if (!answerId || ![-1, 0, 1].includes(value))
        return json27({ error: "Invalid parameters" }, { status: 400 });
      let maxRetries = 3, retryCount = 0;
      for (; retryCount < maxRetries; )
        try {
          return await db.transaction(async () => {
            await db.delete(votes).where(and15(eq20(votes.userId, user.id), eq20(votes.answerId, answerId), eq20(votes.voteType, "ANSWER"), eq20(votes.isQualityVote, !0))), value !== 0 && await db.insert(votes).values({
              id: crypto.randomUUID(),
              userId: user.id,
              answerId,
              value,
              voteType: "ANSWER",
              isQualityVote: !0,
              postId: null,
              commentId: null
            });
            let [upvotesResult, downvotesResult] = await Promise.all([
              db.select({ count: sql8`count(*)` }).from(votes).where(and15(eq20(votes.answerId, answerId), eq20(votes.voteType, "ANSWER"), eq20(votes.isQualityVote, !0), eq20(votes.value, 1))),
              db.select({ count: sql8`count(*)` }).from(votes).where(and15(eq20(votes.answerId, answerId), eq20(votes.voteType, "ANSWER"), eq20(votes.isQualityVote, !0), eq20(votes.value, -1)))
            ]);
            return await db.update(answers).set({
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0
            }).where(eq20(answers.id, answerId)), json27({
              success: !0,
              upvotes: upvotesResult[0]?.count || 0,
              downvotes: downvotesResult[0]?.count || 0,
              userVote: value
            });
          });
        } catch (error) {
          if (retryCount++, error.code === "P2034" && retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
            continue;
          }
          throw error;
        }
      return json27({ error: "Vote operation failed after retries" }, { status: 500 });
    }
    case "claim_bounty": {
      let answerId = formData.get("answerId");
      if (!answerId)
        return json27({ error: "Answer ID is required" }, { status: 400 });
      let answer = await db.query.answers.findFirst({
        where: eq20(answers.id, answerId),
        with: {
          author: {
            columns: {
              id: !0,
              username: !0
            }
          }
        }
      });
      if (!answer)
        return json27({ error: "Answer not found" }, { status: 404 });
      let post = await db.query.posts.findFirst({
        where: eq20(posts.id, answer.postId),
        with: {
          bounty: !0
        }
      });
      return post ? post.authorId !== user.id ? json27({ error: "Only the post author can claim the bounty" }, { status: 403 }) : post.bounty ? post.bounty.status !== "ACTIVE" ? json27({ error: "Bounty is not active" }, { status: 400 }) : await db.transaction(async () => {
        await db.update(answers).set({ isAccepted: !0 }).where(eq20(answers.id, answerId)), await db.update(posts).set({ status: "COMPLETED" }).where(eq20(posts.id, answer.postId)), await db.update(bounties).set({
          status: "CLAIMED",
          winnerId: answer.authorId
        }).where(eq20(bounties.postId, answer.postId));
        let { claimBounty: claimBounty2 } = await Promise.resolve().then(() => (init_virtual_wallet_server(), virtual_wallet_server_exports)), bountyAmount = post.bounty.amount;
        return await claimBounty2(
          db,
          answer.authorId,
          bountyAmount,
          post.bounty.id
        ), json27({
          success: !0,
          message: `Bounty of ${bountyAmount} BBUX transferred to ${answer.author.username}`,
          answer: {
            ...answer,
            isAccepted: !0
          }
        });
      }) : json27({ error: "No bounty found for this post" }, { status: 404 }) : json27({ error: "Post not found" }, { status: 404 });
    }
    case "refund_bounty": {
      let post = await db.query.posts.findFirst({
        where: eq20(posts.id, postId),
        with: { bounty: !0 }
      });
      return post?.bounty ? post.authorId !== user.id ? json27({ error: "Only the post author can refund the bounty" }, { status: 403 }) : (await db.update(bounties).set({
        status: "REFUNDED"
      }).where(eq20(bounties.postId, postId)), json27({ success: !0 })) : json27({ error: "No bounty found" }, { status: 404 });
    }
    case "accept_answer": {
      let answerId = formData.get("answerId");
      if (!answerId)
        return json27({ error: "Answer ID is required" }, { status: 400 });
      let answer = await db.query.answers.findFirst({
        where: eq20(answers.id, answerId),
        with: {
          author: {
            columns: {
              id: !0,
              username: !0
            }
          }
        }
      });
      if (!answer)
        return json27({ error: "Answer not found" }, { status: 404 });
      let post = await db.query.posts.findFirst({
        where: eq20(posts.id, answer.postId)
      });
      return post ? post.authorId !== user.id ? json27({ error: "Only the post author can accept answers" }, { status: 403 }) : await db.transaction(async () => (await db.update(answers).set({ isAccepted: !0 }).where(eq20(answers.id, answerId)), await db.update(posts).set({ status: "COMPLETED" }).where(eq20(posts.id, answer.postId)), json27({
        success: !0,
        message: `Answer accepted by ${answer.author.username}`,
        answer: {
          ...answer,
          isAccepted: !0
        }
      }))) : json27({ error: "Post not found" }, { status: 404 });
    }
    case "deleteComment": {
      let commentId = formData.get("commentId"), comment = await db.select().from(comments).where(eq20(comments.id, commentId)).limit(1);
      if (!comment.length || comment[0].authorId !== user.id)
        throw new Response("Unauthorized", { status: 401 });
      return await db.delete(comments).where(eq20(comments.id, commentId)), { success: !0 };
    }
    case "deleteAnswer": {
      let answerId = formData.get("answerId"), answer = await db.select().from(answers).where(eq20(answers.id, answerId)).limit(1);
      if (!answer.length || answer[0].authorId !== user.id)
        throw new Response("Unauthorized", { status: 401 });
      return await db.delete(answers).where(eq20(answers.id, answerId)), { success: !0 };
    }
    case "updatePost": {
      let title = formData.get("title"), content = formData.get("content"), tags3 = formData.getAll("tags"), bountyAmount = formData.get("bountyAmount");
      if (!user.id)
        throw new Response("Unauthorized", { status: 401 });
      let post = await db.select().from(posts).where(eq20(posts.id, postId)).limit(1);
      if (!post.length || post[0].authorId !== user.id)
        throw new Response("Unauthorized", { status: 401 });
      return await db.transaction(async () => {
        if (await db.update(posts).set({
          title,
          content,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq20(posts.id, postId)), await db.delete(postTags).where(eq20(postTags.postId, postId)), tags3 && tags3.length > 0) {
          let tagValues = tags3.map((tag) => ({
            id: crypto.randomUUID(),
            postId,
            tagId: tag
          }));
          await db.insert(postTags).values(tagValues);
        }
      }), { success: !0 };
    }
    case "reportPost": {
      let reason = formData.get("reason");
      if (!user.id)
        throw new Response("Unauthorized", { status: 401 });
      if ((await db.select().from(reports).where(
        and15(
          eq20(reports.postId, postId),
          eq20(reports.reporterId, user.id)
        )
      ).limit(1)).length > 0)
        throw new Response("Already reported", { status: 400 });
      return await db.insert(reports).values({
        id: crypto.randomUUID(),
        postId,
        reporterId: user.id,
        reason,
        status: "PENDING",
        createdAt: /* @__PURE__ */ new Date()
      }), { success: !0 };
    }
    case "reportComment": {
      let commentId = formData.get("commentId"), reason = formData.get("reason");
      if (!user.id)
        throw new Response("Unauthorized", { status: 401 });
      if ((await db.select().from(reports).where(
        and15(
          eq20(reports.commentId, commentId),
          eq20(reports.reporterId, user.id)
        )
      ).limit(1)).length > 0)
        throw new Response("Already reported", { status: 400 });
      return await db.insert(reports).values({
        id: crypto.randomUUID(),
        commentId,
        reporterId: user.id,
        reason,
        status: "PENDING",
        createdAt: /* @__PURE__ */ new Date()
      }), { success: !0 };
    }
    case "reportAnswer": {
      let answerId = formData.get("answerId"), reason = formData.get("reason");
      if (!user.id)
        throw new Response("Unauthorized", { status: 401 });
      if ((await db.select().from(reports).where(
        and15(
          eq20(reports.answerId, answerId),
          eq20(reports.reporterId, user.id)
        )
      ).limit(1)).length > 0)
        throw new Response("Already reported", { status: 400 });
      return await db.insert(reports).values({
        id: crypto.randomUUID(),
        answerId,
        reporterId: user.id,
        reason,
        status: "PENDING",
        createdAt: /* @__PURE__ */ new Date()
      }), { success: !0 };
    }
    case "toggleBookmark": {
      if (!user.id)
        throw new Response("Unauthorized", { status: 401 });
      return (await db.select().from(bookmarks).where(
        and15(
          eq20(bookmarks.postId, postId),
          eq20(bookmarks.userId, user.id)
        )
      ).limit(1)).length > 0 ? (await db.delete(bookmarks).where(
        and15(
          eq20(bookmarks.postId, postId),
          eq20(bookmarks.userId, user.id)
        )
      ), { bookmarked: !1 }) : (await db.insert(bookmarks).values({
        id: crypto.randomUUID(),
        postId,
        userId: user.id,
        createdAt: /* @__PURE__ */ new Date()
      }), { bookmarked: !0 });
    }
    case "rateIntegrity": {
      let rating = parseInt(formData.get("rating")), reason = formData.get("reason");
      if (!user.id)
        throw new Response("Unauthorized", { status: 401 });
      return (await db.select().from(integrityRatings).where(
        and15(
          eq20(integrityRatings.postId, postId),
          eq20(integrityRatings.raterId, user.id)
        )
      ).limit(1)).length > 0 ? await db.update(integrityRatings).set({
        rating,
        reason,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and15(
          eq20(integrityRatings.postId, postId),
          eq20(integrityRatings.raterId, user.id)
        )
      ) : await db.insert(integrityRatings).values({
        id: crypto.randomUUID(),
        postId,
        raterId: user.id,
        rating,
        reason,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }), { success: !0 };
    }
    case "claimBounty": {
      let answerId = formData.get("answerId");
      if (!user.id)
        throw new Response("Unauthorized", { status: 401 });
      let post = await db.select().from(posts).where(eq20(posts.id, postId)).limit(1);
      if (!post.length)
        throw new Response("Post not found", { status: 404 });
      if (post[0].authorId === user.id)
        throw new Response("Cannot claim your own bounty", { status: 400 });
      let answer = await db.select().from(answers).where(eq20(answers.id, answerId)).limit(1);
      if (!answer.length || answer[0].postId !== postId)
        throw new Response("Answer not found", { status: 404 });
      if (answer[0].authorId !== user.id)
        throw new Response("Cannot claim bounty for another user's answer", { status: 400 });
      if ((await db.select().from(bountyClaims).where(eq20(bountyClaims.postId, postId)).limit(1)).length > 0)
        throw new Response("Bounty already claimed", { status: 400 });
      return await db.transaction(async () => {
        await db.insert(bountyClaims).values({
          id: crypto.randomUUID(),
          postId,
          answerId,
          claimantId: user.id,
          amount: 0,
          // This should be fetched from bounty table
          status: "PENDING",
          createdAt: /* @__PURE__ */ new Date()
        }), await db.update(posts).set({
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq20(posts.id, postId));
      }), { success: !0 };
    }
    default:
      throw new Response("Invalid action", { status: 400 });
  }
};
function ErrorBoundary2() {
  let error = useRouteError2();
  return isRouteErrorResponse2(error) ? /* @__PURE__ */ jsxs13("div", { className: "h-screen w-full bg-neutral-900/95 flex flex-row", children: [
    /* @__PURE__ */ jsx16(Nav, {}),
    /* @__PURE__ */ jsx16("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsx16("div", { className: "w-[85%] max-w-4xl mx-auto mt-4 px-4", children: /* @__PURE__ */ jsx16("div", { className: "bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20", children: /* @__PURE__ */ jsx16("p", { className: "text-red-500", children: error.data }) }) }) })
  ] }) : /* @__PURE__ */ jsxs13("div", { className: "h-screen w-full bg-neutral-900/95 flex flex-row", children: [
    /* @__PURE__ */ jsx16(Nav, {}),
    /* @__PURE__ */ jsx16("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsx16("div", { className: "w-[85%] max-w-4xl mx-auto mt-4 px-4", children: /* @__PURE__ */ jsx16("div", { className: "bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20", children: /* @__PURE__ */ jsx16("p", { className: "text-red-500", children: "An unexpected error occurred" }) }) }) })
  ] });
}
function PostDetail() {
  let { post, currentUser, pagination } = useLoaderData7(), [answers2, setAnswers] = useState8(post.answers), [comments2, setComments] = useState8(post.comments), [votingStates, setVotingStates] = useState8({}), [successMessage, setSuccessMessage] = useState8(null), submit = useSubmit2(), fetcher = useFetcher2(), actionData = useActionData3();
  useEffect6(() => {
    actionData?.success && "message" in actionData && actionData.message && (setSuccessMessage(actionData.message), setTimeout(() => setSuccessMessage(null), 5e3));
  }, [actionData]);
  let sortAnswers = (answers3) => [...answers3].sort((a, b) => a.isAccepted && !b.isAccepted ? -1 : !a.isAccepted && b.isAccepted ? 1 : a.upvotes !== b.upvotes ? b.upvotes - a.upvotes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), sortComments = (comments3) => [...comments3].sort((a, b) => a.upvotes !== b.upvotes ? b.upvotes - a.upvotes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  useEffect6(() => {
    actionData?.success && ("answer" in actionData && actionData.answer ? setAnswers((prev) => {
      let filtered = prev.filter((a) => !a.id.startsWith("temp-")), newAnswers = [actionData.answer, ...filtered];
      return sortAnswers(newAnswers);
    }) : "comment" in actionData && actionData.comment ? setComments((prev) => {
      let filtered = prev.filter((c) => !c.id.startsWith("temp-")), newComments = [actionData.comment, ...filtered];
      return sortComments(newComments);
    }) : "message" in actionData && actionData.message && actionData.message.includes("Bounty") && "answer" in actionData && actionData.answer && setAnswers((prev) => {
      let updatedAnswers = prev.map(
        (a) => a.id === actionData.answer.id ? { ...a, isAccepted: !0 } : a
      );
      return sortAnswers(updatedAnswers);
    }));
  }, [actionData]);
  let handleAnswerVote = async (answerId, value) => {
    let voteKey = `answer-${answerId}`;
    if (votingStates[voteKey])
      return;
    setVotingStates((prev) => ({ ...prev, [voteKey]: !0 })), setAnswers((prev) => {
      let updatedAnswers = prev.map((answer) => {
        if (answer.id === answerId) {
          let currentVote = answer.userVote || 0, newUpvotes = answer.upvotes, newDownvotes = answer.downvotes;
          return currentVote === 1 ? newUpvotes -= 1 : currentVote === -1 && (newDownvotes -= 1), value === 1 ? newUpvotes += 1 : value === -1 && (newDownvotes += 1), {
            ...answer,
            userVote: value,
            upvotes: newUpvotes,
            downvotes: newDownvotes
          };
        }
        return answer;
      });
      return sortAnswers(updatedAnswers);
    });
    let formData = new FormData();
    formData.append("action", "answerVote"), formData.append("answerId", answerId), formData.append("value", value.toString()), submit(formData, { method: "post" }), setTimeout(() => {
      setVotingStates((prev) => ({ ...prev, [voteKey]: !1 }));
    }, 1e3);
  }, handleCommentVote = async (commentId, value) => {
    let voteKey = `comment-${commentId}`;
    if (votingStates[voteKey])
      return;
    setVotingStates((prev) => ({ ...prev, [voteKey]: !0 })), setComments((prev) => {
      let updatedComments = prev.map((comment) => {
        if (comment.id === commentId) {
          let currentVote = comment.userVote || 0, newUpvotes = comment.upvotes, newDownvotes = comment.downvotes;
          return currentVote === 1 ? newUpvotes -= 1 : currentVote === -1 && (newDownvotes -= 1), value === 1 ? newUpvotes += 1 : value === -1 && (newDownvotes += 1), {
            ...comment,
            userVote: value,
            upvotes: newUpvotes,
            downvotes: newDownvotes
          };
        }
        return comment;
      });
      return sortComments(updatedComments);
    });
    let formData = new FormData();
    formData.append("action", "commentVote"), formData.append("commentId", commentId), formData.append("value", value.toString()), submit(formData, { method: "post" }), setTimeout(() => {
      setVotingStates((prev) => ({ ...prev, [voteKey]: !1 }));
    }, 1e3);
  }, handleComment = async (content) => {
    if (!currentUser)
      return;
    let optimisticComment = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        profile: currentUser.profilePicture ? { profilePicture: currentUser.profilePicture } : null
      }
    };
    setComments((prev) => {
      let newComments = [optimisticComment, ...prev];
      return sortComments(newComments);
    });
    let formData = new FormData();
    formData.append("action", "comment"), formData.append("content", content), submit(formData, { method: "post" });
  }, handleAnswer = async (content) => {
    if (!currentUser)
      return;
    let optimisticAnswer = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      isAccepted: !1,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        profile: currentUser.profilePicture ? { profilePicture: currentUser.profilePicture } : null
      }
    };
    setAnswers((prev) => {
      let newAnswers = [optimisticAnswer, ...prev];
      return sortAnswers(newAnswers);
    });
    let formData = new FormData();
    formData.append("action", "answer"), formData.append("content", content), submit(formData, { method: "post" });
  }, handleAcceptAnswer = async (answerId) => {
    let formData = new FormData();
    formData.append("action", "acceptAnswer"), formData.append("answerId", answerId), submit(formData, { method: "post" });
  }, handleDelete = () => {
    let formData = new FormData();
    formData.append("action", "deletePost"), submit(formData, { method: "post" });
  }, handleQualityVote = async (value) => {
    let formData = new FormData();
    formData.append("action", "qualityVote"), formData.append("value", value.toString()), submit(formData, { method: "post" });
  };
  return /* @__PURE__ */ jsxs13("div", { className: "min-h-screen bg-neutral-900 text-white", children: [
    /* @__PURE__ */ jsx16(Nav, {}),
    /* @__PURE__ */ jsx16("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsx16("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxs13("div", { className: "bg-neutral-800 rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx16(
            "img",
            {
              src: getProfilePicture(post.author.profilePicture, post.author.username),
              alt: `${post.author.username}'s avatar`,
              className: "w-10 h-10 rounded-full"
            }
          ),
          /* @__PURE__ */ jsxs13("div", { children: [
            /* @__PURE__ */ jsx16("h1", { className: "text-2xl font-bold text-white", children: post.title }),
            /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-2 text-sm text-gray-400", children: [
              /* @__PURE__ */ jsx16("span", { children: "Posted by " }),
              /* @__PURE__ */ jsx16(
                Link7,
                {
                  to: `/${post.author.username}`,
                  className: "text-violet-400 hover:text-violet-300 transition-colors",
                  children: post.author.username
                }
              ),
              currentUser && currentUser.id !== post.author.id && /* @__PURE__ */ jsx16(
                IntegrityRatingButton,
                {
                  targetUser: post.author,
                  context: post.hasBounty ? "BOUNTY_REJECTION" : "GENERAL",
                  referenceId: post.id,
                  referenceType: "POST",
                  variant: "badge",
                  className: "ml-2"
                }
              ),
              /* @__PURE__ */ jsx16("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx16("span", { children: new Date(post.createdAt).toLocaleDateString() })
            ] })
          ] })
        ] }),
        currentUser?.id === post.author.id && /* @__PURE__ */ jsx16(
          "button",
          {
            onClick: handleDelete,
            className: "p-2 text-red-400 hover:text-red-300 transition-colors",
            children: /* @__PURE__ */ jsx16(FiTrash22, { className: "h-5 w-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "prose prose-invert max-w-none mb-6", children: [
        /* @__PURE__ */ jsx16("p", { className: "text-gray-300", children: post.content }),
        post.media && post.media.length > 0 && /* @__PURE__ */ jsxs13("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsx16("h3", { className: "text-lg font-semibold text-white mb-4", children: "Media" }),
          /* @__PURE__ */ jsx16("div", { className: `grid gap-4 ${post.media.length === 1 ? "grid-cols-1" : post.media.length === 2 ? "grid-cols-1 md:grid-cols-2" : post.media.length === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`, children: post.media.map((mediaItem) => /* @__PURE__ */ jsxs13("div", { className: "rounded-lg overflow-hidden bg-neutral-800/50 border border-neutral-700/50", children: [
            mediaItem.type === "IMAGE" && /* @__PURE__ */ jsx16(
              "img",
              {
                src: mediaItem.url,
                alt: "Post media",
                className: "w-full max-w-4xl max-h-96 object-contain rounded-t-lg bg-neutral-900"
              }
            ),
            mediaItem.type === "VIDEO" && /* @__PURE__ */ jsxs13(
              "video",
              {
                controls: !0,
                className: "w-full max-w-4xl max-h-96 object-contain rounded-t-lg bg-black",
                poster: mediaItem.thumbnailUrl,
                children: [
                  /* @__PURE__ */ jsx16("source", { src: mediaItem.url, type: "video/mp4" }),
                  "Your browser does not support the video tag."
                ]
              }
            ),
            mediaItem.type === "AUDIO" && /* @__PURE__ */ jsx16("div", { className: "p-4", children: /* @__PURE__ */ jsxs13("audio", { controls: !0, className: "w-full", children: [
              /* @__PURE__ */ jsx16("source", { src: mediaItem.url, type: "audio/mpeg" }),
              "Your browser does not support the audio tag."
            ] }) }),
            (mediaItem.isScreenRecording || mediaItem.type === "VIDEO") && /* @__PURE__ */ jsx16("div", { className: "px-3 py-2 bg-neutral-700/50 border-t border-neutral-600/50", children: /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx16("span", { className: "text-violet-400", children: mediaItem.isScreenRecording ? "\u{1F4F9} Screen Recording" : "\u{1F3A5} Video" }),
              /* @__PURE__ */ jsx16("span", { className: "text-gray-400 text-xs", children: mediaItem.type })
            ] }) }),
            mediaItem.type === "IMAGE" && /* @__PURE__ */ jsx16("div", { className: "px-3 py-2 bg-neutral-700/50 border-t border-neutral-600/50", children: /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx16("span", { className: "text-violet-400", children: "\u{1F5BC}\uFE0F Image" }),
              /* @__PURE__ */ jsx16("span", { className: "text-gray-400 text-xs", children: mediaItem.type })
            ] }) }),
            mediaItem.type === "AUDIO" && /* @__PURE__ */ jsx16("div", { className: "px-3 py-2 bg-neutral-700/50 border-t border-neutral-600/50", children: /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx16("span", { className: "text-violet-400", children: "\u{1F3B5} Audio" }),
              /* @__PURE__ */ jsx16("span", { className: "text-gray-400 text-xs", children: mediaItem.type })
            ] }) })
          ] }, mediaItem.id)) })
        ] }),
        post.codeBlocks && post.codeBlocks.length > 0 && /* @__PURE__ */ jsxs13("div", { className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsx16("h3", { className: "text-lg font-semibold text-white", children: "Code" }),
          post.codeBlocks.map((codeBlock) => /* @__PURE__ */ jsxs13("div", { className: "rounded-lg overflow-hidden border border-neutral-600/50", children: [
            /* @__PURE__ */ jsx16("div", { className: "bg-neutral-700/50 px-4 py-3 border-b border-neutral-600/50", children: /* @__PURE__ */ jsx16("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx16("span", { className: "px-2 py-1 bg-violet-500/20 text-violet-300 text-sm font-medium rounded-md", children: codeBlock.language }),
              codeBlock.description && /* @__PURE__ */ jsx16("span", { className: "text-gray-300 text-sm", children: codeBlock.description })
            ] }) }) }),
            /* @__PURE__ */ jsx16(
              SyntaxHighlighter,
              {
                language: codeBlock.language,
                style: vscDarkPlus,
                customStyle: {
                  margin: 0,
                  borderRadius: "0",
                  fontSize: "0.875rem"
                },
                showLineNumbers: !0,
                wrapLines: !0,
                children: codeBlock.code
              }
            )
          ] }, codeBlock.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-4 mb-6", children: [
        /* @__PURE__ */ jsx16(
          "button",
          {
            onClick: () => handleQualityVote(post.userQualityVote === 1 ? 0 : 1),
            className: `p-2 transition-colors ${post.userQualityVote === 1 ? "text-violet-400" : "text-gray-400 hover:text-violet-400"}`,
            children: /* @__PURE__ */ jsx16(FiArrowUp, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsx16("span", { className: "text-gray-300", children: post.qualityUpvotes - post.qualityDownvotes }),
        /* @__PURE__ */ jsx16(
          "button",
          {
            onClick: () => handleQualityVote(post.userQualityVote === -1 ? 0 : -1),
            className: `p-2 transition-colors ${post.userQualityVote === -1 ? "text-violet-400" : "text-gray-400 hover:text-violet-400"}`,
            children: /* @__PURE__ */ jsx16(FiArrowDown, { className: "h-5 w-5" })
          }
        )
      ] }),
      post.bounty && /* @__PURE__ */ jsxs13("div", { className: "mt-8 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg shadow-lg shadow-cyan-500/10", children: [
        /* @__PURE__ */ jsxs13("h2", { className: "text-lg font-medium text-cyan-300 mb-2 flex items-center", children: [
          /* @__PURE__ */ jsx16("span", { className: "mr-2", children: "\u{1F4B0}" }),
          "Bounty"
        ] }),
        /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs13("div", { children: [
            /* @__PURE__ */ jsxs13("p", { className: "text-cyan-100 font-semibold text-lg", children: [
              post.bounty.amount,
              " ",
              post.bounty.tokenSymbol
            ] }),
            /* @__PURE__ */ jsxs13("p", { className: "text-sm text-cyan-200/70", children: [
              "Expires: ",
              new Date(post.bounty.expiresAt).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs13("div", { className: "text-sm text-cyan-200/70", children: [
            "Status: ",
            /* @__PURE__ */ jsx16("span", { className: "text-cyan-300 font-medium", children: post.bounty.status })
          ] })
        ] }),
        post.bounty.status === "ACTIVE" && post.authorId === currentUser?.id && /* @__PURE__ */ jsx16("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxs13(Form4, { method: "post", children: [
          /* @__PURE__ */ jsx16("input", { type: "hidden", name: "action", value: "refund_bounty" }),
          /* @__PURE__ */ jsx16(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow",
              children: "Refund Bounty"
            }
          )
        ] }) })
      ] }),
      successMessage && /* @__PURE__ */ jsx16("div", { className: "mt-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg", children: /* @__PURE__ */ jsx16("p", { className: "text-green-500", children: successMessage }) }),
      /* @__PURE__ */ jsxs13("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxs13("h2", { className: "text-xl font-semibold text-white mb-4", children: [
          "Answers (",
          pagination.totalAnswers,
          ")"
        ] }),
        /* @__PURE__ */ jsxs13("form", { onSubmit: (e) => {
          e.preventDefault();
          let textarea = e.target.querySelector("textarea");
          textarea.value.trim() && (handleAnswer(textarea.value), textarea.value = "");
        }, className: "mb-6", children: [
          /* @__PURE__ */ jsx16(
            "textarea",
            {
              placeholder: "Write an answer...",
              className: "w-full p-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500",
              rows: 6
            }
          ),
          /* @__PURE__ */ jsx16(
            "button",
            {
              type: "submit",
              className: "mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors",
              children: "Post Answer"
            }
          )
        ] }),
        /* @__PURE__ */ jsx16("div", { className: "max-h-96 overflow-y-auto custom-scrollbar space-y-4 pr-2", children: sortAnswers(answers2).map((answer) => /* @__PURE__ */ jsxs13("div", { className: `p-4 rounded-md border ${answer.isAccepted ? "bg-green-500/10 border-green-500/50" : "bg-neutral-700/50 border-violet-500/20"}`, children: [
          /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx16(
                "img",
                {
                  src: getProfilePicture(answer.author.profile?.profilePicture ?? null, answer.author.username),
                  alt: `${answer.author.username}'s avatar`,
                  className: "w-8 h-8 rounded-full"
                }
              ),
              /* @__PURE__ */ jsx16(
                Link7,
                {
                  to: `/${answer.author.username}`,
                  className: "font-semibold text-violet-400 hover:text-violet-300 transition-colors",
                  children: answer.author.username
                }
              ),
              /* @__PURE__ */ jsx16("span", { className: "text-gray-400", children: new Date(answer.createdAt).toLocaleDateString() }),
              answer.isAccepted && /* @__PURE__ */ jsx16("span", { className: "px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm", children: "Accepted Answer" })
            ] }),
            /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx16(
                "button",
                {
                  onClick: () => handleAnswerVote(answer.id, answer.userVote === 1 ? 0 : 1),
                  disabled: votingStates[`answer-${answer.id}`],
                  className: `p-1 transition-colors ${answer.userVote === 1 ? "text-violet-400" : "text-gray-400 hover:text-violet-400"} ${votingStates[`answer-${answer.id}`] ? "opacity-50 cursor-not-allowed" : ""}`,
                  children: /* @__PURE__ */ jsx16(FiArrowUp, { className: "h-5 w-5" })
                }
              ),
              /* @__PURE__ */ jsx16("span", { className: "text-gray-300", children: answer.upvotes - answer.downvotes }),
              /* @__PURE__ */ jsx16(
                "button",
                {
                  onClick: () => handleAnswerVote(answer.id, answer.userVote === -1 ? 0 : -1),
                  disabled: votingStates[`answer-${answer.id}`],
                  className: `p-1 transition-colors ${answer.userVote === -1 ? "text-violet-400" : "text-gray-400 hover:text-violet-400"} ${votingStates[`answer-${answer.id}`] ? "opacity-50 cursor-not-allowed" : ""}`,
                  children: /* @__PURE__ */ jsx16(FiArrowDown, { className: "h-5 w-5" })
                }
              ),
              currentUser && currentUser.id !== answer.author.id && /* @__PURE__ */ jsx16(
                IntegrityRatingButton,
                {
                  targetUser: answer.author,
                  context: "ANSWER_QUALITY",
                  referenceId: answer.id,
                  referenceType: "ANSWER",
                  variant: "icon",
                  className: "ml-1"
                }
              ),
              currentUser?.id === post.author.id && !answers2.some((a) => a.isAccepted) && /* @__PURE__ */ jsxs13(Form4, { method: "post", children: [
                /* @__PURE__ */ jsx16("input", { type: "hidden", name: "action", value: post.bounty && post.bounty.status === "ACTIVE" ? "claim_bounty" : "accept_answer" }),
                /* @__PURE__ */ jsx16("input", { type: "hidden", name: "answerId", value: answer.id }),
                /* @__PURE__ */ jsx16(
                  "button",
                  {
                    type: "submit",
                    className: `px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-lg ${post.bounty && post.bounty.status === "ACTIVE" ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-500/25" : "bg-green-500 hover:bg-green-600 shadow-green-500/25"}`,
                    children: post.bounty && post.bounty.status === "ACTIVE" ? "Accept Answer & Claim Bounty" : "Accept Answer"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx16("p", { className: "mt-2 text-gray-300", children: answer.content })
        ] }, answer.id)) })
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxs13("h2", { className: "text-xl font-semibold text-white mb-4", children: [
          "Comments (",
          pagination.totalComments,
          ")"
        ] }),
        /* @__PURE__ */ jsxs13("form", { onSubmit: (e) => {
          e.preventDefault();
          let textarea = e.target.querySelector("textarea");
          textarea.value.trim() && (handleComment(textarea.value), textarea.value = "");
        }, className: "mb-6", children: [
          /* @__PURE__ */ jsx16(
            "textarea",
            {
              placeholder: "Write a comment...",
              className: "w-full p-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500",
              rows: 4
            }
          ),
          /* @__PURE__ */ jsx16(
            "button",
            {
              type: "submit",
              className: "mt-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors",
              children: "Post Comment"
            }
          )
        ] }),
        /* @__PURE__ */ jsx16("div", { className: "max-h-96 overflow-y-auto custom-scrollbar space-y-4 pr-2", children: sortComments(comments2).map((comment) => /* @__PURE__ */ jsxs13("div", { className: "p-4 bg-neutral-700/50 rounded-md border border-violet-500/20", children: [
          /* @__PURE__ */ jsxs13("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx16(
                "img",
                {
                  src: getProfilePicture(comment.author.profile?.profilePicture ?? null, comment.author.username),
                  alt: `${comment.author.username}'s avatar`,
                  className: "w-6 h-6 rounded-full"
                }
              ),
              /* @__PURE__ */ jsx16(
                Link7,
                {
                  to: `/${comment.author.username}`,
                  className: "font-semibold text-violet-400 hover:text-violet-300 transition-colors",
                  children: comment.author.username
                }
              ),
              /* @__PURE__ */ jsx16("span", { className: "text-gray-400 text-sm", children: new Date(comment.createdAt).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsxs13("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx16(
                "button",
                {
                  onClick: () => handleCommentVote(comment.id, comment.userVote === 1 ? 0 : 1),
                  disabled: votingStates[`comment-${comment.id}`],
                  className: `p-1 transition-colors ${comment.userVote === 1 ? "text-violet-400" : "text-gray-400 hover:text-violet-400"} ${votingStates[`comment-${comment.id}`] ? "opacity-50 cursor-not-allowed" : ""}`,
                  children: /* @__PURE__ */ jsx16(FiArrowUp, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx16("span", { className: "text-gray-300 text-sm", children: comment.upvotes - comment.downvotes }),
              /* @__PURE__ */ jsx16(
                "button",
                {
                  onClick: () => handleCommentVote(comment.id, comment.userVote === -1 ? 0 : -1),
                  disabled: votingStates[`comment-${comment.id}`],
                  className: `p-1 transition-colors ${comment.userVote === -1 ? "text-violet-400" : "text-gray-400 hover:text-violet-400"} ${votingStates[`comment-${comment.id}`] ? "opacity-50 cursor-not-allowed" : ""}`,
                  children: /* @__PURE__ */ jsx16(FiArrowDown, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx16("p", { className: "mt-2 text-gray-300", children: comment.content })
        ] }, comment.id)) })
      ] })
    ] }) }) })
  ] });
}

// app/routes/posts.create.tsx
var posts_create_exports = {};
__export(posts_create_exports, {
  ErrorBoundary: () => ErrorBoundary3,
  action: () => action20,
  default: () => CreatePost,
  loader: () => loader14,
  meta: () => meta2
});
import { useState as useState12 } from "react";
import { Form as Form5, useLoaderData as useLoaderData8, useActionData as useActionData4, redirect as redirect3, useRouteError as useRouteError3, useNavigation as useNavigation2 } from "@remix-run/react";
import { json as json28 } from "@remix-run/node";

// app/components/CodeBlockEditor.tsx
import { useState as useState9 } from "react";
import { FiCopy, FiCheck, FiPlus, FiTrash2 as FiTrash23 } from "react-icons/fi";
import { jsx as jsx17, jsxs as jsxs14 } from "react/jsx-runtime";
var SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "swift",
  "go",
  "rust",
  "html",
  "css",
  "sql",
  "bash",
  "json",
  "yaml",
  "markdown",
  "plaintext"
];
function CodeBlockEditor({ codeBlocks: codeBlocks3, onCodeBlocksChange }) {
  let [currentBlock, setCurrentBlock] = useState9({
    language: "",
    code: "",
    description: ""
  }), [copiedIndex, setCopiedIndex] = useState9(null), handleAddCodeBlock = () => {
    currentBlock.language && currentBlock.code && (onCodeBlocksChange([...codeBlocks3, currentBlock]), setCurrentBlock({ language: "", code: "", description: "" }));
  }, handleRemoveCodeBlock = (index) => {
    onCodeBlocksChange(codeBlocks3.filter((_, i) => i !== index));
  }, handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code), setCopiedIndex(index), setTimeout(() => setCopiedIndex(null), 2e3);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxs14("div", { className: "space-y-6", children: [
    codeBlocks3.map((block, index) => /* @__PURE__ */ jsxs14("div", { className: "bg-neutral-800/80 rounded-lg p-4 border border-violet-500/30", children: [
      /* @__PURE__ */ jsxs14("div", { className: "flex justify-between items-center mb-2", children: [
        /* @__PURE__ */ jsxs14("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx17("span", { className: "px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-sm", children: block.language }),
          /* @__PURE__ */ jsx17(
            "button",
            {
              type: "button",
              onClick: () => handleCopyCode(block.code, index),
              className: "p-1 text-gray-400 hover:text-violet-400 transition-colors",
              title: "Copy code",
              children: copiedIndex === index ? /* @__PURE__ */ jsx17(FiCheck, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx17(FiCopy, { className: "w-4 h-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx17(
          "button",
          {
            type: "button",
            onClick: () => handleRemoveCodeBlock(index),
            className: "p-1 text-gray-400 hover:text-red-400 transition-colors",
            title: "Remove code block",
            children: /* @__PURE__ */ jsx17(FiTrash23, { className: "w-4 h-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx17("pre", { className: "bg-neutral-900/80 p-4 rounded-lg overflow-x-auto", children: /* @__PURE__ */ jsx17("code", { className: "text-sm text-gray-300", children: block.code }) }),
      block.description && /* @__PURE__ */ jsx17("p", { className: "mt-2 text-sm text-gray-400", children: block.description })
    ] }, index)),
    /* @__PURE__ */ jsx17("div", { className: "bg-neutral-800/80 rounded-lg p-4 border border-violet-500/30", children: /* @__PURE__ */ jsxs14("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs14("div", { children: [
        /* @__PURE__ */ jsx17("label", { htmlFor: "language", className: "block text-sm font-medium text-violet-300 mb-2", children: "Language" }),
        /* @__PURE__ */ jsxs14(
          "select",
          {
            id: "language",
            value: currentBlock.language,
            onChange: (e) => setCurrentBlock({ ...currentBlock, language: e.target.value }),
            className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500",
            children: [
              /* @__PURE__ */ jsx17("option", { value: "", children: "Select a language" }),
              SUPPORTED_LANGUAGES.map((lang) => /* @__PURE__ */ jsx17("option", { value: lang, children: lang.charAt(0).toUpperCase() + lang.slice(1) }, lang))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs14("div", { children: [
        /* @__PURE__ */ jsx17("label", { htmlFor: "code", className: "block text-sm font-medium text-violet-300 mb-2", children: "Code" }),
        /* @__PURE__ */ jsx17(
          "textarea",
          {
            id: "code",
            value: currentBlock.code,
            onChange: (e) => setCurrentBlock({ ...currentBlock, code: e.target.value }),
            rows: 6,
            placeholder: "Paste your code here...",
            className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white font-mono text-sm focus:border-violet-500 focus:ring-violet-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs14("div", { children: [
        /* @__PURE__ */ jsx17("label", { htmlFor: "description", className: "block text-sm font-medium text-violet-300 mb-2", children: "Description (optional)" }),
        /* @__PURE__ */ jsx17(
          "input",
          {
            type: "text",
            id: "description",
            value: currentBlock.description,
            onChange: (e) => setCurrentBlock({ ...currentBlock, description: e.target.value }),
            placeholder: "Add a brief description of the code...",
            className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs14(
        "button",
        {
          type: "button",
          onClick: handleAddCodeBlock,
          disabled: !currentBlock.language || !currentBlock.code,
          className: "inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: [
            /* @__PURE__ */ jsx17(FiPlus, { className: "w-4 h-4" }),
            "Add Code Block"
          ]
        }
      )
    ] }) })
  ] });
}

// app/components/MediaUpload.tsx
import { useState as useState10, useRef, useCallback as useCallback2, useEffect as useEffect7 } from "react";
import { FiUpload, FiVideo, FiX as FiX2 } from "react-icons/fi";
import { jsx as jsx18, jsxs as jsxs15 } from "react/jsx-runtime";
async function uploadToCloudinary2(file, resourceType, uploadPreset, cloudName, folder) {
  let formData = new FormData();
  formData.append("file", file), formData.append("upload_preset", uploadPreset), formData.append("folder", folder);
  let endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, response = await fetch(endpoint, {
    method: "POST",
    body: formData
  });
  if (!response.ok)
    throw new Error("Failed to upload to Cloudinary");
  return response.json();
}
function MediaUpload({ onMediaUpload, onMediaRemove, uploadedMedia }) {
  let [isRecording, setIsRecording] = useState10(!1), [isUploading, setIsUploading] = useState10(!1), mediaRecorderRef = useRef(null), recordedChunksRef = useRef([]), fileInputRef = useRef(null), streamRef = useRef(null), cleanupRecording = useCallback2(() => {
    mediaRecorderRef.current && (mediaRecorderRef.current.state !== "inactive" && mediaRecorderRef.current.stop(), mediaRecorderRef.current = null), streamRef.current && (streamRef.current.getTracks().forEach((track) => track.stop()), streamRef.current = null), recordedChunksRef.current = [], setIsRecording(!1);
  }, []);
  useEffect7(() => () => {
    cleanupRecording();
  }, [cleanupRecording]);
  let startScreenRecording = useCallback2(async () => {
    try {
      if (cleanupRecording(), !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia)
        throw new Error("Screen recording is not supported in this browser");
      let stream = await navigator.mediaDevices.getDisplayMedia({ video: !0, audio: !0 });
      streamRef.current = stream;
      let mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder, recordedChunksRef.current = [], mediaRecorder.ondataavailable = (event) => {
        event.data.size > 0 && recordedChunksRef.current.push(event.data);
      }, mediaRecorder.onstop = async () => {
        if (recordedChunksRef.current.length === 0) {
          cleanupRecording();
          return;
        }
        let blob2 = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setIsUploading(!0);
        try {
          let uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "portal", cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dqobhvk07";
          if (!uploadPreset || !cloudName)
            throw new Error("Cloudinary config missing");
          let url = (await uploadToCloudinary2(blob2, "video", uploadPreset, cloudName, "portal/posts")).secure_url;
          try {
            let video = document.createElement("video");
            video.src = url, video.crossOrigin = "anonymous", video.onloadeddata = () => {
              try {
                video.currentTime = 1;
                let canvas = document.createElement("canvas");
                canvas.width = video.videoWidth, canvas.height = video.videoHeight;
                let ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(video, 0, 0);
                  let thumbnailUrl = canvas.toDataURL("image/jpeg");
                  onMediaUpload({
                    type: "VIDEO",
                    url,
                    thumbnailUrl,
                    isScreenRecording: !0
                  });
                } else
                  onMediaUpload({
                    type: "VIDEO",
                    url,
                    isScreenRecording: !0
                  });
              } catch {
                onMediaUpload({
                  type: "VIDEO",
                  url,
                  isScreenRecording: !0
                });
              }
            }, video.onerror = () => {
              onMediaUpload({
                type: "VIDEO",
                url,
                isScreenRecording: !0
              });
            };
          } catch {
            onMediaUpload({
              type: "VIDEO",
              url,
              isScreenRecording: !0
            });
          }
        } catch (error) {
          alert(error instanceof Error ? error.message : "Failed to upload screen recording");
        } finally {
          setIsUploading(!1), cleanupRecording();
        }
      }, stream.getVideoTracks()[0].onended = () => {
        mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive" && mediaRecorderRef.current.stop();
      }, mediaRecorder.start(), setIsRecording(!0);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to start screen recording"), cleanupRecording();
    }
  }, [onMediaUpload, cleanupRecording]), stopScreenRecording = useCallback2(() => {
    mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive" && mediaRecorderRef.current.stop();
  }, []);
  return /* @__PURE__ */ jsxs15("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx18("div", { className: "text-sm text-gray-400 mb-2", children: /* @__PURE__ */ jsx18("p", { children: "\u{1F4C1} File size limits: Images (50MB), Videos (100MB) - Powered by Cloudinary" }) }),
    /* @__PURE__ */ jsxs15("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsxs15(
        "button",
        {
          type: "button",
          onClick: isRecording ? stopScreenRecording : startScreenRecording,
          disabled: isUploading,
          className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-violet-500 hover:bg-violet-600"} text-white disabled:opacity-50 disabled:cursor-not-allowed`,
          children: [
            /* @__PURE__ */ jsx18(FiVideo, { className: "w-5 h-5" }),
            isRecording ? "Stop Recording" : "Record Screen"
          ]
        }
      ),
      /* @__PURE__ */ jsxs15(
        "button",
        {
          type: "button",
          onClick: () => fileInputRef.current?.click(),
          disabled: isRecording || isUploading,
          className: "flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: [
            /* @__PURE__ */ jsx18(FiUpload, { className: "w-5 h-5" }),
            "Upload Media"
          ]
        }
      ),
      /* @__PURE__ */ jsx18(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "video/*,image/*",
          onChange: async (e) => {
            let file = e.target.files?.[0];
            if (file) {
              setIsUploading(!0);
              try {
                let isVideo = file.type.startsWith("video/"), isImage = file.type.startsWith("image/");
                if (!isVideo && !isImage)
                  throw new Error("Please upload a video or image file");
                let maxSize = isVideo ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
                if (file.size > maxSize)
                  throw new Error(`File size must be less than ${isVideo ? "100MB" : "50MB"}`);
                let uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "portal", cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dqobhvk07";
                if (!uploadPreset || !cloudName)
                  throw new Error("Cloudinary config missing");
                let url = (await uploadToCloudinary2(file, isVideo ? "video" : "image", uploadPreset, cloudName, "portal/posts")).secure_url;
                if (isVideo)
                  try {
                    let video = document.createElement("video");
                    video.src = url, video.crossOrigin = "anonymous", video.onloadeddata = () => {
                      try {
                        video.currentTime = 1;
                        let canvas = document.createElement("canvas");
                        canvas.width = video.videoWidth, canvas.height = video.videoHeight;
                        let ctx = canvas.getContext("2d");
                        if (ctx) {
                          ctx.drawImage(video, 0, 0);
                          let thumbnailUrl = canvas.toDataURL("image/jpeg");
                          onMediaUpload({
                            type: "VIDEO",
                            url,
                            thumbnailUrl,
                            isScreenRecording: !1
                          });
                        } else
                          onMediaUpload({
                            type: "VIDEO",
                            url,
                            isScreenRecording: !1
                          });
                      } catch (error) {
                        console.error("Failed to create video thumbnail:", error), onMediaUpload({
                          type: "VIDEO",
                          url,
                          isScreenRecording: !1
                        });
                      }
                    }, video.onerror = () => {
                      onMediaUpload({
                        type: "VIDEO",
                        url,
                        isScreenRecording: !1
                      });
                    };
                  } catch (error) {
                    console.error("Failed to process video file:", error), onMediaUpload({
                      type: "VIDEO",
                      url,
                      isScreenRecording: !1
                    });
                  }
                else
                  onMediaUpload({
                    type: "IMAGE",
                    url,
                    isScreenRecording: !1
                  });
              } catch (error) {
                console.error("File upload error:", error);
                let errorMessage = error instanceof Error ? error.message : "Failed to upload file";
                alert(errorMessage);
              } finally {
                setIsUploading(!1), fileInputRef.current && (fileInputRef.current.value = "");
              }
            }
          },
          className: "hidden",
          disabled: isRecording || isUploading
        }
      )
    ] }),
    uploadedMedia.length > 0 && /* @__PURE__ */ jsx18("div", { className: "grid grid-cols-2 gap-4", children: uploadedMedia.map((media3, index) => /* @__PURE__ */ jsxs15("div", { className: "relative group", children: [
      media3.type === "VIDEO" ? /* @__PURE__ */ jsx18(
        "video",
        {
          src: media3.url,
          poster: media3.thumbnailUrl,
          className: "w-full h-48 object-cover rounded-lg",
          controls: !0
        }
      ) : /* @__PURE__ */ jsx18(
        "img",
        {
          src: media3.url,
          alt: "Uploaded media",
          className: "w-full h-48 object-cover rounded-lg"
        }
      ),
      /* @__PURE__ */ jsx18(
        "button",
        {
          type: "button",
          onClick: () => onMediaRemove(index),
          className: "absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
          children: /* @__PURE__ */ jsx18(FiX2, { className: "w-4 h-4" })
        }
      ),
      media3.isScreenRecording && /* @__PURE__ */ jsx18("span", { className: "absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-sm rounded", children: "Screen Recording" })
    ] }, index)) }),
    (isRecording || isUploading) && /* @__PURE__ */ jsxs15("div", { className: "flex items-center gap-2 text-violet-400", children: [
      /* @__PURE__ */ jsx18("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-violet-400" }),
      /* @__PURE__ */ jsx18("span", { children: isRecording ? "Recording..." : "Uploading..." })
    ] })
  ] });
}

// app/routes/posts.create.tsx
init_virtual_wallet_server();
init_schema();
import { eq as eq21, asc as asc2 } from "drizzle-orm";
import { z as z9 } from "zod";

// app/components/TagSelector.tsx
import { useState as useState11, useEffect as useEffect8, useRef as useRef2 } from "react";
import { FiX as FiX3, FiTag } from "react-icons/fi";
import { jsx as jsx19, jsxs as jsxs16 } from "react/jsx-runtime";
function TagSelector({
  selectedTags,
  onTagsChange,
  availableTags,
  error,
  required = !0
}) {
  let [isOpen, setIsOpen] = useState11(!1), [searchTerm, setSearchTerm] = useState11(""), dropdownRef = useRef2(null), filteredTags = availableTags.filter(
    (tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()) || tag.description?.toLowerCase().includes(searchTerm.toLowerCase()) || tag.description === null
  ), selectedTagObjects = availableTags.filter(
    (tag) => selectedTags.includes(tag.id)
  );
  useEffect8(() => {
    let handleClickOutside = (event) => {
      dropdownRef.current && !dropdownRef.current.contains(event.target) && (setIsOpen(!1), setSearchTerm(""));
    };
    return isOpen && document.addEventListener("mousedown", handleClickOutside), () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  let handleTagToggle = (tagId) => {
    let newSelectedTags = selectedTags.includes(tagId) ? selectedTags.filter((id) => id !== tagId) : [...selectedTags, tagId];
    onTagsChange(newSelectedTags);
  }, removeTag = (tagId) => {
    let newSelectedTags = selectedTags.filter((id) => id !== tagId);
    onTagsChange(newSelectedTags);
  }, handleKeyDown = (e) => {
    e.key === "Escape" && (setIsOpen(!1), setSearchTerm(""));
  };
  return /* @__PURE__ */ jsxs16("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs16("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs16("label", { className: "block text-sm font-medium text-white", children: [
        "Tags ",
        required && /* @__PURE__ */ jsx19("span", { className: "text-red-400", children: "*" })
      ] }),
      /* @__PURE__ */ jsxs16("span", { className: "text-xs text-gray-400", children: [
        selectedTags.length,
        " selected"
      ] })
    ] }),
    selectedTagObjects.length > 0 && /* @__PURE__ */ jsx19("div", { className: "flex flex-wrap gap-2 mb-3", children: selectedTagObjects.map((tag) => /* @__PURE__ */ jsxs16(
      "div",
      {
        className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        style: {
          backgroundColor: `${tag.color}20`,
          color: tag.color,
          border: `1px solid ${tag.color}40`
        },
        children: [
          /* @__PURE__ */ jsx19(FiTag, { className: "w-3 h-3 mr-1" }),
          tag.name,
          /* @__PURE__ */ jsx19(
            "button",
            {
              type: "button",
              onClick: () => removeTag(tag.id),
              className: "ml-2 hover:bg-black/20 rounded-full p-0.5 transition-colors",
              children: /* @__PURE__ */ jsx19(FiX3, { className: "w-3 h-3" })
            }
          )
        ]
      },
      tag.id
    )) }),
    /* @__PURE__ */ jsxs16("div", { className: "relative", children: [
      /* @__PURE__ */ jsx19(
        "button",
        {
          type: "button",
          onClick: () => setIsOpen(!isOpen),
          className: `w-full px-4 py-3 text-left bg-neutral-800/60 border rounded-lg transition-colors ${error ? "border-red-500/50 focus:border-red-500" : "border-violet-500/30 focus:border-violet-500"} ${isOpen ? "border-violet-500" : "hover:border-violet-500/50"}`,
          children: /* @__PURE__ */ jsxs16("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx19("span", { className: selectedTags.length === 0 ? "text-gray-400" : "text-white", children: selectedTags.length === 0 ? "Select at least one tag..." : `${selectedTags.length} tag${selectedTags.length === 1 ? "" : "s"} selected` }),
            /* @__PURE__ */ jsxs16("div", { className: "flex items-center space-x-2", children: [
              selectedTags.length > 0 && /* @__PURE__ */ jsxs16("span", { className: "text-xs text-gray-400", children: [
                selectedTags.length,
                "/10"
              ] }),
              /* @__PURE__ */ jsx19(
                "svg",
                {
                  className: `w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`,
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx19("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                }
              )
            ] })
          ] })
        }
      ),
      isOpen && /* @__PURE__ */ jsxs16("div", { className: "absolute z-50 w-full mt-1 bg-neutral-800 border border-violet-500/30 rounded-lg shadow-xl max-h-64 overflow-hidden", ref: dropdownRef, children: [
        /* @__PURE__ */ jsx19("div", { className: "p-3 border-b border-violet-500/20", children: /* @__PURE__ */ jsx19(
          "input",
          {
            type: "text",
            placeholder: "Search tags...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            onKeyDown: handleKeyDown,
            className: "w-full px-3 py-2 bg-neutral-700/50 border border-violet-500/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
          }
        ) }),
        /* @__PURE__ */ jsx19("div", { className: "max-h-48 overflow-y-auto", children: filteredTags.length === 0 ? /* @__PURE__ */ jsxs16("div", { className: "p-4 text-center text-gray-400", children: [
          'No tags found matching "',
          searchTerm,
          '"'
        ] }) : /* @__PURE__ */ jsx19("div", { className: "p-2", children: filteredTags.map((tag) => {
          let isSelected = selectedTags.includes(tag.id);
          return /* @__PURE__ */ jsxs16(
            "button",
            {
              type: "button",
              onClick: () => handleTagToggle(tag.id),
              className: `w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isSelected ? "bg-violet-500/20 border border-violet-500/40" : "hover:bg-neutral-700/50 border border-transparent"}`,
              children: [
                /* @__PURE__ */ jsxs16("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx19(
                    "div",
                    {
                      className: "w-3 h-3 rounded-full",
                      style: { backgroundColor: tag.color }
                    }
                  ),
                  /* @__PURE__ */ jsxs16("div", { className: "text-left", children: [
                    /* @__PURE__ */ jsx19("div", { className: "font-medium text-white", children: tag.name }),
                    /* @__PURE__ */ jsx19("div", { className: "text-sm text-gray-400", children: tag.description || "No description" })
                  ] })
                ] }),
                isSelected && /* @__PURE__ */ jsx19("div", { className: "w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx19("svg", { className: "w-3 h-3 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx19("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) })
              ]
            },
            tag.id
          );
        }) }) }),
        /* @__PURE__ */ jsx19("div", { className: "p-3 border-t border-violet-500/20 bg-neutral-700/30", children: /* @__PURE__ */ jsxs16("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxs16("span", { className: "text-gray-400", children: [
            selectedTags.length,
            " of ",
            availableTags.length,
            " tags selected"
          ] }),
          required && selectedTags.length === 0 && /* @__PURE__ */ jsx19("span", { className: "text-red-400", children: "At least one tag required" })
        ] }) })
      ] })
    ] }),
    error && /* @__PURE__ */ jsx19("p", { className: "text-sm text-red-400", children: error }),
    /* @__PURE__ */ jsx19("p", { className: "text-xs text-gray-400", children: "Tags help categorize your post and make it easier for others to find. Select tags that best describe your content." })
  ] });
}

// app/routes/posts.create.tsx
init_bounty_bucks_info();
import { FiGift, FiDollarSign, FiClock as FiClock2, FiInfo } from "react-icons/fi";
import { Fragment as Fragment4, jsx as jsx20, jsxs as jsxs17 } from "react/jsx-runtime";
var TOKEN_SYMBOL3 = bounty_bucks_info_default.symbol, meta2 = () => [
  { title: "Create Post - portal.ask" },
  { name: "description", content: "Create a new question or discussion post on portal.ask" }
], loader14 = async ({ request, context }) => {
  let userId = await requireUserId(request), db = createDb(context.env.DB), user = (await db.select({ id: users.id, username: users.username }).from(users).where(eq21(users.id, userId)).limit(1))[0];
  if (!user)
    throw new Error("User not found");
  let availableTags = await db.select({
    id: tags.id,
    name: tags.name,
    description: tags.description,
    color: tags.color
  }).from(tags).orderBy(asc2(tags.name));
  return json28({ user, availableTags });
};
async function action20({ request, context }) {
  let userId = await requireUserId(request), formData = await request.formData(), title = formData.get("title"), content = formData.get("content"), bountyAmount = formData.get("bountyAmount"), validation = z9.object({
    title: z9.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    content: z9.string().min(10, "Content must be at least 10 characters"),
    bountyAmount: z9.string().optional()
  }).safeParse({ title, content, bountyAmount });
  if (!validation.success)
    return json28({ error: validation.error.errors[0].message }, { status: 400 });
  let db = createDb(context.env.DB);
  try {
    let [post] = await db.insert(posts).values({
      id: crypto.randomUUID(),
      title: validation.data.title,
      content: validation.data.content,
      authorId: userId
    }).returning().all();
    if (validation.data.bountyAmount && parseFloat(validation.data.bountyAmount) > 0) {
      let amount = parseFloat(validation.data.bountyAmount), wallet = await getVirtualWallet(db, userId);
      if (wallet || (wallet = await createVirtualWallet(db, userId)), !wallet)
        return json28({ error: "Failed to create wallet" }, { status: 500 });
      if (wallet.balance < amount)
        return json28({ error: "Insufficient balance to create bounty" }, { status: 400 });
      let [bounty] = await db.insert(bounties).values({
        id: crypto.randomUUID(),
        postId: post.id,
        amount,
        status: "ACTIVE",
        tokenDecimals: 9,
        refundLockPeriod: 24,
        refundPenalty: 0,
        communityFee: 0.05
      }).returning().all();
      await createBounty(db, userId, amount, bounty.id);
    }
    return redirect3(`/posts/${post.id}`);
  } catch (error) {
    return console.error("Error creating post:", error), json28({ error: "Failed to create post" }, { status: 500 });
  }
}
function CreatePost() {
  let { user, availableTags } = useLoaderData8(), actionData = useActionData4(), isSubmitting = useNavigation2().state === "submitting", [codeBlocks3, setCodeBlocks] = useState12([]), [media3, setMedia] = useState12([]), [hasBounty, setHasBounty] = useState12(!1), [bountyAmount, setBountyAmount] = useState12(""), [bountyDuration, setBountyDuration] = useState12(7), [clientError, setClientError] = useState12(null), [selectedTags, setSelectedTags] = useState12([]), handleMediaUpload = (newMedia) => {
    setMedia((prev) => [...prev, newMedia]);
  }, handleMediaRemove = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };
  return /* @__PURE__ */ jsx20(Layout, { children: /* @__PURE__ */ jsxs17("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsx20("div", { className: "mb-6 flex justify-between items-center mt-16", children: /* @__PURE__ */ jsx20("h1", { className: "text-2xl font-bold text-white", children: "Create New Post" }) }),
    /* @__PURE__ */ jsxs17(Form5, { method: "post", className: "space-y-6 max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsx20("input", { type: "hidden", name: "codeBlocks", value: JSON.stringify(codeBlocks3) }),
      /* @__PURE__ */ jsx20("input", { type: "hidden", name: "media", value: JSON.stringify(media3) }),
      /* @__PURE__ */ jsx20("input", { type: "hidden", name: "hasBounty", value: hasBounty ? "on" : "off" }),
      hasBounty && /* @__PURE__ */ jsxs17(Fragment4, { children: [
        /* @__PURE__ */ jsx20("input", { type: "hidden", name: "bountyAmount", value: bountyAmount }),
        /* @__PURE__ */ jsx20("input", { type: "hidden", name: "bountyDuration", value: bountyDuration.toString() })
      ] }),
      /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20(
          TagSelector,
          {
            selectedTags,
            onTagsChange: setSelectedTags,
            availableTags,
            error: actionData?.error?.includes("tag") ? actionData.error : void 0,
            required: !0
          }
        ),
        selectedTags.map((tagId) => /* @__PURE__ */ jsx20("input", { type: "hidden", name: "tags", value: tagId }, tagId))
      ] }),
      /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20("label", { htmlFor: "title", className: "block text-sm font-medium text-violet-300 mb-2", children: "Title" }),
        /* @__PURE__ */ jsx20(
          "input",
          {
            type: "text",
            name: "title",
            id: "title",
            className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500",
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20("label", { htmlFor: "content", className: "block text-sm font-medium text-violet-300 mb-2", children: "Content" }),
        /* @__PURE__ */ jsx20(
          "textarea",
          {
            name: "content",
            id: "content",
            rows: 6,
            className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500",
            required: !0
          }
        )
      ] }),
      /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Media" }),
        /* @__PURE__ */ jsx20(
          MediaUpload,
          {
            onMediaUpload: handleMediaUpload,
            onMediaRemove: handleMediaRemove,
            uploadedMedia: media3
          }
        )
      ] }),
      /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Code Blocks" }),
        /* @__PURE__ */ jsx20(
          CodeBlockEditor,
          {
            codeBlocks: codeBlocks3,
            onCodeBlocksChange: setCodeBlocks
          }
        )
      ] }),
      /* @__PURE__ */ jsxs17("div", { children: [
        /* @__PURE__ */ jsx20("label", { className: "block text-sm font-medium text-violet-300 mb-3", children: /* @__PURE__ */ jsxs17("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx20(FiGift, { className: "w-4 h-4" }),
          "Bounty Settings"
        ] }) }),
        /* @__PURE__ */ jsxs17("div", { className: "bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-violet-500/20 rounded-xl p-6 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs17("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxs17("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs17("div", { className: "relative", children: [
                /* @__PURE__ */ jsx20(
                  "input",
                  {
                    type: "checkbox",
                    id: "hasBounty",
                    checked: hasBounty,
                    onChange: (e) => setHasBounty(e.target.checked),
                    className: "sr-only"
                  }
                ),
                /* @__PURE__ */ jsx20(
                  "label",
                  {
                    htmlFor: "hasBounty",
                    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${hasBounty ? "bg-violet-500" : "bg-neutral-600"}`,
                    children: /* @__PURE__ */ jsx20(
                      "span",
                      {
                        className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${hasBounty ? "translate-x-6" : "translate-x-1"}`
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs17("div", { children: [
                /* @__PURE__ */ jsx20("label", { htmlFor: "hasBounty", className: "text-white font-medium cursor-pointer", children: "Add Crypto Bounty" }),
                /* @__PURE__ */ jsx20("p", { className: "text-gray-400 text-sm", children: "Reward the best answer with tokens" })
              ] })
            ] }),
            hasBounty && /* @__PURE__ */ jsxs17("div", { className: "flex items-center gap-2 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full", children: [
              /* @__PURE__ */ jsx20(FiGift, { className: "w-4 h-4 text-violet-300" }),
              /* @__PURE__ */ jsx20("span", { className: "text-violet-300 text-sm font-medium", children: "Active" })
            ] })
          ] }),
          hasBounty && /* @__PURE__ */ jsxs17("div", { className: "space-y-6 animate-in slide-in-from-top-2 duration-300", children: [
            /* @__PURE__ */ jsxs17("div", { className: "bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/50", children: [
              /* @__PURE__ */ jsxs17("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx20(FiDollarSign, { className: "w-4 h-4 text-yellow-400" }),
                /* @__PURE__ */ jsx20("label", { className: "text-white font-medium", children: "Bounty Amount" })
              ] }),
              /* @__PURE__ */ jsxs17("div", { className: "relative", children: [
                /* @__PURE__ */ jsx20(
                  "input",
                  {
                    type: "number",
                    value: bountyAmount,
                    onChange: (e) => setBountyAmount(e.target.value),
                    min: "0",
                    step: "0.01",
                    required: !0,
                    placeholder: "0.00",
                    className: "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600/50 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                  }
                ),
                /* @__PURE__ */ jsx20("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm", children: TOKEN_SYMBOL3 })
              ] }),
              /* @__PURE__ */ jsxs17("div", { className: "flex items-center gap-2 mt-2 text-xs text-gray-400", children: [
                /* @__PURE__ */ jsx20(FiInfo, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsx20("span", { children: "5% goes to community governance rewards" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs17("div", { className: "bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/50", children: [
              /* @__PURE__ */ jsxs17("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsx20(FiClock2, { className: "w-4 h-4 text-blue-400" }),
                /* @__PURE__ */ jsx20("label", { className: "text-white font-medium", children: "Bounty Duration" })
              ] }),
              /* @__PURE__ */ jsxs17("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx20(
                  "input",
                  {
                    type: "number",
                    value: bountyDuration,
                    onChange: (e) => setBountyDuration(Number(e.target.value)),
                    min: "1",
                    max: "30",
                    required: !0,
                    className: "px-4 py-3 bg-neutral-800/50 border border-neutral-600/50 rounded-lg text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                  }
                ),
                /* @__PURE__ */ jsx20("div", { className: "flex items-center justify-center px-4 py-3 bg-neutral-800/30 border border-neutral-600/30 rounded-lg text-gray-300 text-sm", children: "days" })
              ] }),
              /* @__PURE__ */ jsxs17("div", { className: "flex items-center gap-2 mt-2 text-xs text-gray-400", children: [
                /* @__PURE__ */ jsx20(FiInfo, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsxs17("span", { children: [
                  "Bounty expires after ",
                  bountyDuration,
                  " days"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs17("div", { className: "bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-lg p-4", children: [
              /* @__PURE__ */ jsx20("h4", { className: "text-violet-300 font-medium mb-2", children: "Bounty Summary" }),
              /* @__PURE__ */ jsxs17("div", { className: "space-y-2 text-sm", children: [
                /* @__PURE__ */ jsxs17("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx20("span", { className: "text-gray-400", children: "Amount:" }),
                  /* @__PURE__ */ jsx20("span", { className: "text-white font-medium", children: bountyAmount ? `${parseFloat(bountyAmount).toFixed(2)} ${TOKEN_SYMBOL3}` : "0.00 SOL" })
                ] }),
                /* @__PURE__ */ jsxs17("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx20("span", { className: "text-gray-400", children: "Duration:" }),
                  /* @__PURE__ */ jsxs17("span", { className: "text-white font-medium", children: [
                    bountyDuration,
                    " days"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs17("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx20("span", { className: "text-gray-400", children: "Governance Fee:" }),
                  /* @__PURE__ */ jsx20("span", { className: "text-yellow-400 font-medium", children: bountyAmount ? `${(parseFloat(bountyAmount) * 0.05).toFixed(3)} ${TOKEN_SYMBOL3}` : "0.000 SOL" })
                ] }),
                /* @__PURE__ */ jsx20("div", { className: "border-t border-violet-500/20 pt-2 mt-2", children: /* @__PURE__ */ jsxs17("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx20("span", { className: "text-gray-400", children: "Total Cost:" }),
                  /* @__PURE__ */ jsx20("span", { className: "text-violet-300 font-semibold", children: bountyAmount ? `${(parseFloat(bountyAmount) * 1.05).toFixed(3)} ${TOKEN_SYMBOL3}` : "0.000 SOL" })
                ] }) })
              ] })
            ] })
          ] }),
          !hasBounty && /* @__PURE__ */ jsx20("div", { className: "bg-neutral-700/20 rounded-lg p-4 border border-neutral-600/30", children: /* @__PURE__ */ jsxs17("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx20(FiInfo, { className: "w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxs17("div", { children: [
              /* @__PURE__ */ jsx20("h4", { className: "text-gray-300 font-medium mb-1", children: "No Bounty Selected" }),
              /* @__PURE__ */ jsx20("p", { className: "text-gray-400 text-sm", children: "Enable bounty to reward the best answer with tokens. This will attract more attention to your question and incentivize quality responses." })
            ] })
          ] }) })
        ] })
      ] }),
      (actionData?.error || clientError) && /* @__PURE__ */ jsx20("div", { className: "bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg", children: actionData?.error || clientError }),
      /* @__PURE__ */ jsx20("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx20(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:bg-violet-500/50 disabled:cursor-not-allowed disabled:hover:bg-violet-500/50 transition-colors",
          children: isSubmitting ? "Creating Post..." : "Create Post"
        }
      ) })
    ] })
  ] }) });
}
function ErrorBoundary3() {
  let error = useRouteError3();
  return /* @__PURE__ */ jsx20(Layout, { children: /* @__PURE__ */ jsx20("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs17("div", { className: "bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsx20("h2", { className: "text-2xl font-bold text-white mb-4 text-center", children: "Post Creation Failed" }),
    /* @__PURE__ */ jsx20("p", { className: "text-gray-300 mb-6 text-center", children: error instanceof Error ? error.message : "An unexpected error occurred while creating your post. Please try again." }),
    /* @__PURE__ */ jsxs17("div", { className: "flex justify-center space-x-4", children: [
      /* @__PURE__ */ jsx20(
        "a",
        {
          href: "/posts/create",
          className: "bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded transition-colors",
          children: "Try Again"
        }
      ),
      /* @__PURE__ */ jsx20(
        "a",
        {
          href: "/",
          className: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors",
          children: "Return Home"
        }
      )
    ] })
  ] }) }) });
}

// app/routes/transactions.tsx
var transactions_exports = {};
__export(transactions_exports, {
  default: () => TransactionsPage,
  loader: () => loader15,
  meta: () => meta3
});
import { json as json29 } from "@remix-run/node";
import { useLoaderData as useLoaderData9, Link as Link9 } from "@remix-run/react";
import { jsx as jsx21, jsxs as jsxs18 } from "react/jsx-runtime";
var TOKEN_SYMBOL4 = "BBUX", meta3 = () => [
  { title: "Transactions - portal.ask" },
  { name: "description", content: "View your portal.ask transaction history" }
];
async function loader15({ request, context }) {
  let db = createDb(context.env.DB), user = await getUser(request, db);
  if (!user)
    throw new Response("Unauthorized", { status: 401 });
  return json29({ user, transactions: [] });
}
function TransactionsPage() {
  let { transactions } = useLoaderData9(), formatAmount = (amount) => `${amount} ${TOKEN_SYMBOL4}`, getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400";
      case "COMPLETED":
        return "text-green-400";
      case "FAILED":
        return "text-red-400";
      case "CANCELLED":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  }, getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "COMPLETED":
        return "Completed";
      case "FAILED":
        return "Failed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };
  return /* @__PURE__ */ jsx21(Layout, { children: /* @__PURE__ */ jsxs18("div", { className: "max-w-4xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxs18("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx21(
        Link9,
        {
          to: "/wallet",
          className: "text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mb-4 inline-block",
          children: "\u2190 Back to Wallet"
        }
      ),
      /* @__PURE__ */ jsx21("h1", { className: "text-3xl font-bold text-white mb-2", children: "Transaction History" }),
      /* @__PURE__ */ jsxs18("p", { className: "text-gray-300", children: [
        "View all your ",
        TOKEN_SYMBOL4,
        " transactions"
      ] })
    ] }),
    transactions.length === 0 ? /* @__PURE__ */ jsx21("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxs18("div", { className: "text-gray-400 mb-4", children: [
      /* @__PURE__ */ jsx21("svg", { className: "w-16 h-16 mx-auto mb-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx21("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
      /* @__PURE__ */ jsx21("p", { className: "text-lg font-medium", children: "No Transactions" }),
      /* @__PURE__ */ jsx21("p", { className: "text-sm", children: "You haven't made any transactions yet" })
    ] }) }) : /* @__PURE__ */ jsx21("div", { className: "space-y-4", children: transactions.map((transaction) => /* @__PURE__ */ jsxs18("div", { className: "bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]", children: [
      /* @__PURE__ */ jsxs18("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx21("h3", { className: "text-lg font-semibold text-white", children: transaction.type }),
        /* @__PURE__ */ jsx21("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`, children: getStatusText(transaction.status) })
      ] }),
      /* @__PURE__ */ jsxs18("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs18("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx21("span", { className: "text-gray-400", children: "Amount:" }),
          /* @__PURE__ */ jsx21("span", { className: "text-white font-semibold", children: formatAmount(transaction.amount) })
        ] }),
        /* @__PURE__ */ jsxs18("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx21("span", { className: "text-gray-400", children: "Date:" }),
          /* @__PURE__ */ jsx21("span", { className: "text-white", children: new Date(transaction.createdAt).toLocaleString() })
        ] }),
        transaction.description && /* @__PURE__ */ jsxs18("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx21("span", { className: "text-gray-400", children: "Description:" }),
          /* @__PURE__ */ jsx21("span", { className: "text-white text-sm", children: transaction.description })
        ] }),
        transaction.solanaSignature && /* @__PURE__ */ jsxs18("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx21("span", { className: "text-gray-400", children: "Transaction:" }),
          /* @__PURE__ */ jsxs18("span", { className: "text-white text-sm", children: [
            transaction.solanaSignature.slice(0, 8),
            "...",
            transaction.solanaSignature.slice(-8)
          ] })
        ] })
      ] })
    ] }, transaction.id)) })
  ] }) });
}

// app/routes/docs.legal.tsx
var docs_legal_exports = {};
__export(docs_legal_exports, {
  default: () => LegalDocsPage,
  loader: () => loader16
});
import { json as json30 } from "@remix-run/node";
import { useLoaderData as useLoaderData10, Link as Link10 } from "@remix-run/react";
import { FiArrowLeft as FiArrowLeft3, FiDownload as FiDownload3, FiShield as FiShield3, FiFileText } from "react-icons/fi";
import { jsx as jsx22, jsxs as jsxs19 } from "react/jsx-runtime";
var loader16 = async () => json30({
  title: "Legal Documents",
  description: "Privacy policy and terms of service with PDF download options"
});
function LegalDocsPage() {
  let data = useLoaderData10(), { title, description } = data;
  return /* @__PURE__ */ jsx22(Layout, { children: /* @__PURE__ */ jsxs19("div", { className: "w-auto max-w-6xl mx-auto mt-4 px-4 ml-24 pb-16", children: [
    /* @__PURE__ */ jsxs19("div", { className: "mb-8 mt-16", children: [
      /* @__PURE__ */ jsxs19(
        Link10,
        {
          to: "/docs",
          className: "inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors mb-4",
          children: [
            /* @__PURE__ */ jsx22(FiArrowLeft3, { className: "w-4 h-4 mr-2" }),
            "Back to Documentation"
          ]
        }
      ),
      /* @__PURE__ */ jsx22("h1", { className: "text-4xl font-bold text-white mb-4", children: title }),
      /* @__PURE__ */ jsx22("p", { className: "text-gray-400 text-lg max-w-3xl", children: description })
    ] }),
    /* @__PURE__ */ jsxs19("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs19("div", { className: "bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8", children: [
        /* @__PURE__ */ jsxs19("div", { className: "flex items-center mb-6", children: [
          /* @__PURE__ */ jsx22(FiShield3, { className: "w-8 h-8 text-violet-400 mr-4" }),
          /* @__PURE__ */ jsxs19("div", { children: [
            /* @__PURE__ */ jsx22("h2", { className: "text-2xl font-semibold text-white", children: "Privacy Policy" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400", children: "How we collect, use, and protect your personal information" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs19("div", { className: "prose prose-invert prose-violet max-w-none mb-6", children: [
          /* @__PURE__ */ jsx22("p", { children: "Our privacy policy explains how portal.ask collects, uses, and protects your personal information. We are committed to transparency and protecting your privacy while providing our services." }),
          /* @__PURE__ */ jsx22("h3", { children: "What We Collect" }),
          /* @__PURE__ */ jsxs19("ul", { children: [
            /* @__PURE__ */ jsx22("li", { children: "Account information (email, username, profile data)" }),
            /* @__PURE__ */ jsx22("li", { children: "Content you create (posts, answers, comments)" }),
            /* @__PURE__ */ jsx22("li", { children: "Usage data and analytics" }),
            /* @__PURE__ */ jsx22("li", { children: "Blockchain transaction data" }),
            /* @__PURE__ */ jsx22("li", { children: "Media files you upload" })
          ] }),
          /* @__PURE__ */ jsx22("h3", { children: "How We Use Your Data" }),
          /* @__PURE__ */ jsxs19("ul", { children: [
            /* @__PURE__ */ jsx22("li", { children: "Provide and improve our services" }),
            /* @__PURE__ */ jsx22("li", { children: "Process transactions and bounties" }),
            /* @__PURE__ */ jsx22("li", { children: "Maintain community standards" }),
            /* @__PURE__ */ jsx22("li", { children: "Send important notifications" }),
            /* @__PURE__ */ jsx22("li", { children: "Analyze platform usage" })
          ] }),
          /* @__PURE__ */ jsx22("h3", { children: "Your Rights" }),
          /* @__PURE__ */ jsxs19("ul", { children: [
            /* @__PURE__ */ jsx22("li", { children: "Access your personal data" }),
            /* @__PURE__ */ jsx22("li", { children: "Request data correction or deletion" }),
            /* @__PURE__ */ jsx22("li", { children: "Export your data" }),
            /* @__PURE__ */ jsx22("li", { children: "Opt out of communications" }),
            /* @__PURE__ */ jsx22("li", { children: "Control privacy settings" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs19("div", { className: "flex flex-col sm:flex-row gap-4", children: [
          /* @__PURE__ */ jsxs19(
            Link10,
            {
              to: "/privacy",
              className: "inline-flex items-center justify-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx22(FiFileText, { className: "w-4 h-4 mr-2" }),
                "View Privacy Policy"
              ]
            }
          ),
          /* @__PURE__ */ jsxs19(
            "a",
            {
              href: "/api/privacy.pdf",
              className: "inline-flex items-center justify-center px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx22(FiDownload3, { className: "w-4 h-4 mr-2" }),
                "Download PDF"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs19("div", { className: "bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8", children: [
        /* @__PURE__ */ jsxs19("div", { className: "flex items-center mb-6", children: [
          /* @__PURE__ */ jsx22(FiFileText, { className: "w-8 h-8 text-violet-400 mr-4" }),
          /* @__PURE__ */ jsxs19("div", { children: [
            /* @__PURE__ */ jsx22("h2", { className: "text-2xl font-semibold text-white", children: "Terms of Service" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400", children: "Rules and guidelines for using portal.ask" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs19("div", { className: "prose prose-invert prose-violet max-w-none mb-6", children: [
          /* @__PURE__ */ jsx22("p", { children: "Our terms of service outline the rules and guidelines for using portal.ask. By using our platform, you agree to these terms and our community standards." }),
          /* @__PURE__ */ jsx22("h3", { children: "Acceptable Use" }),
          /* @__PURE__ */ jsxs19("ul", { children: [
            /* @__PURE__ */ jsx22("li", { children: "Respect other users and their contributions" }),
            /* @__PURE__ */ jsx22("li", { children: "Provide accurate and helpful information" }),
            /* @__PURE__ */ jsx22("li", { children: "Follow community guidelines" }),
            /* @__PURE__ */ jsx22("li", { children: "Respect intellectual property rights" }),
            /* @__PURE__ */ jsx22("li", { children: "Maintain account security" })
          ] }),
          /* @__PURE__ */ jsx22("h3", { children: "Prohibited Activities" }),
          /* @__PURE__ */ jsxs19("ul", { children: [
            /* @__PURE__ */ jsx22("li", { children: "Harassment or bullying" }),
            /* @__PURE__ */ jsx22("li", { children: "Spam or promotional content" }),
            /* @__PURE__ */ jsx22("li", { children: "Plagiarism or copyright violation" }),
            /* @__PURE__ */ jsx22("li", { children: "Impersonation of others" }),
            /* @__PURE__ */ jsx22("li", { children: "Sharing personal information without consent" })
          ] }),
          /* @__PURE__ */ jsx22("h3", { children: "Bounty System Rules" }),
          /* @__PURE__ */ jsxs19("ul", { children: [
            /* @__PURE__ */ jsx22("li", { children: "Bounties must be for legitimate questions" }),
            /* @__PURE__ */ jsx22("li", { children: "Answers must be original and helpful" }),
            /* @__PURE__ */ jsx22("li", { children: "Disputes will be resolved fairly" }),
            /* @__PURE__ */ jsx22("li", { children: "Platform fees apply to transactions" }),
            /* @__PURE__ */ jsx22("li", { children: "Refunds available under certain conditions" })
          ] }),
          /* @__PURE__ */ jsx22("h3", { children: "Intellectual Property" }),
          /* @__PURE__ */ jsxs19("ul", { children: [
            /* @__PURE__ */ jsx22("li", { children: "You retain rights to your content" }),
            /* @__PURE__ */ jsx22("li", { children: "You grant us license to display your content" }),
            /* @__PURE__ */ jsx22("li", { children: "Respect others' intellectual property" }),
            /* @__PURE__ */ jsx22("li", { children: "Report copyright violations" }),
            /* @__PURE__ */ jsx22("li", { children: "DMCA compliance procedures" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs19("div", { className: "flex flex-col sm:flex-row gap-4", children: [
          /* @__PURE__ */ jsxs19(
            Link10,
            {
              to: "/terms",
              className: "inline-flex items-center justify-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx22(FiFileText, { className: "w-4 h-4 mr-2" }),
                "View Terms of Service"
              ]
            }
          ),
          /* @__PURE__ */ jsxs19(
            "a",
            {
              href: "/api/terms.pdf",
              className: "inline-flex items-center justify-center px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx22(FiDownload3, { className: "w-4 h-4 mr-2" }),
                "Download PDF"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs19("div", { className: "bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8", children: [
        /* @__PURE__ */ jsx22("h2", { className: "text-2xl font-semibold text-white mb-6", children: "Additional Legal Information" }),
        /* @__PURE__ */ jsxs19("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs19("div", { className: "bg-neutral-700/40 rounded-lg p-6", children: [
            /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-white mb-3", children: "Data Protection" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400 text-sm mb-4", children: "We implement industry-standard security measures to protect your data and comply with relevant data protection regulations." }),
            /* @__PURE__ */ jsxs19("ul", { className: "text-gray-400 text-sm space-y-1", children: [
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Encryption in transit and at rest" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Regular security audits" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 GDPR compliance" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Data breach notification" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs19("div", { className: "bg-neutral-700/40 rounded-lg p-6", children: [
            /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-white mb-3", children: "Blockchain & Cryptocurrency" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400 text-sm mb-4", children: "Our platform uses blockchain technology and cryptocurrency. Please understand the risks and regulatory considerations." }),
            /* @__PURE__ */ jsxs19("ul", { className: "text-gray-400 text-sm space-y-1", children: [
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Cryptocurrency volatility" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Regulatory compliance" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Transaction fees" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Wallet security" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs19("div", { className: "bg-neutral-700/40 rounded-lg p-6", children: [
            /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-white mb-3", children: "Dispute Resolution" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400 text-sm mb-4", children: "We provide fair and transparent dispute resolution processes for bounty claims and community issues." }),
            /* @__PURE__ */ jsxs19("ul", { className: "text-gray-400 text-sm space-y-1", children: [
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Community moderation" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Appeal process" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Arbitration options" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Legal recourse" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs19("div", { className: "bg-neutral-700/40 rounded-lg p-6", children: [
            /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-white mb-3", children: "Updates & Changes" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400 text-sm mb-4", children: "We may update our legal documents from time to time. Users will be notified of significant changes." }),
            /* @__PURE__ */ jsxs19("ul", { className: "text-gray-400 text-sm space-y-1", children: [
              /* @__PURE__ */ jsx22("li", { children: "\u2022 30-day notice for changes" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Continued use acceptance" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Version history tracking" }),
              /* @__PURE__ */ jsx22("li", { children: "\u2022 Opt-out options" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs19("div", { className: "bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-lg border border-violet-500/30 p-8", children: [
        /* @__PURE__ */ jsx22("h2", { className: "text-2xl font-semibold text-white mb-6", children: "Legal Contact Information" }),
        /* @__PURE__ */ jsxs19("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxs19("div", { children: [
            /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-white mb-3", children: "General Inquiries" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400 mb-2", children: "For general legal questions about portal.ask:" }),
            /* @__PURE__ */ jsx22(
              "a",
              {
                href: "mailto:bountybucks524@gmail.com",
                className: "text-violet-400 hover:text-violet-300 transition-colors",
                children: "bountybucks524@gmail.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs19("div", { children: [
            /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-white mb-3", children: "Legal Notices" }),
            /* @__PURE__ */ jsx22("p", { className: "text-gray-400 mb-2", children: "For legal notices, DMCA takedowns, or other legal matters:" }),
            /* @__PURE__ */ jsx22(
              "a",
              {
                href: "mailto:legal@portal.ask",
                className: "text-violet-400 hover:text-violet-300 transition-colors",
                children: "legal@portal.ask"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs19("div", { className: "mt-6 p-4 bg-neutral-800/60 rounded-lg", children: [
          /* @__PURE__ */ jsx22("h3", { className: "text-lg font-semibold text-white mb-2", children: "Important Notes" }),
          /* @__PURE__ */ jsxs19("ul", { className: "text-gray-400 text-sm space-y-1", children: [
            /* @__PURE__ */ jsx22("li", { children: "\u2022 These documents are for informational purposes only" }),
            /* @__PURE__ */ jsx22("li", { children: "\u2022 Consult with legal professionals for specific advice" }),
            /* @__PURE__ */ jsx22("li", { children: "\u2022 Laws may vary by jurisdiction" }),
            /* @__PURE__ */ jsx22("li", { children: "\u2022 We reserve the right to modify these terms" })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}

// app/routes/$username.tsx
var username_exports = {};
__export(username_exports, {
  default: () => UserProfile,
  loader: () => loader17
});
import { json as json31 } from "@remix-run/cloudflare";
import { useLoaderData as useLoaderData11, Link as Link11 } from "@remix-run/react";

// app/utils/reputationLevel.ts
function getReputationLevel(points) {
  return points >= 1e3 ? "Legend" : points >= 500 ? "Expert" : points >= 250 ? "Advanced" : points >= 100 ? "Intermediate" : points >= 50 ? "Contributor" : "Beginner";
}

// app/routes/$username.tsx
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaDiscord,
  FaReddit,
  FaMedium,
  FaStackOverflow,
  FaDev
} from "react-icons/fa";
import { FiThumbsUp as FiThumbsUp3, FiEdit2 as FiEdit23 } from "react-icons/fi";

// app/components/IntegrityDisplay.tsx
import { useState as useState13 } from "react";
import { FiStar as FiStar3, FiShield as FiShield4 } from "react-icons/fi";
import { Fragment as Fragment5, jsx as jsx23, jsxs as jsxs20 } from "react/jsx-runtime";
function IntegrityDisplay({
  user,
  currentUserId,
  canRate = !1,
  context,
  referenceId,
  referenceType
}) {
  let [showRatingModal, setShowRatingModal] = useState13(!1), integrityLevel = getIntegrityLevel(user.integrityScore), integrityColor = getIntegrityColor(user.integrityScore);
  return /* @__PURE__ */ jsxs20(Fragment5, { children: [
    /* @__PURE__ */ jsxs20("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
      /* @__PURE__ */ jsxs20("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxs20("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx23(FiShield4, { className: "w-5 h-5 text-violet-400" }),
          /* @__PURE__ */ jsx23("h3", { className: "text-lg font-semibold text-violet-300", children: "Integrity Score" })
        ] }),
        canRate && currentUserId !== user.id && /* @__PURE__ */ jsx23(
          "button",
          {
            onClick: () => setShowRatingModal(!0),
            className: "px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]",
            children: "Rate User"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs20("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs20("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx23("div", { className: `text-3xl font-bold ${integrityColor}`, children: user.integrityScore.toFixed(1) }),
          /* @__PURE__ */ jsx23("div", { className: "text-sm text-gray-400", children: "out of 10" }),
          /* @__PURE__ */ jsx23("div", { className: `text-sm font-medium ${integrityColor} mt-1`, children: integrityLevel })
        ] }),
        /* @__PURE__ */ jsxs20("div", { className: "flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsx23("div", { className: "flex items-center space-x-1 mb-2", children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => /* @__PURE__ */ jsx23(
            FiStar3,
            {
              className: `w-4 h-4 ${star <= user.integrityScore ? "text-yellow-400 fill-current" : "text-gray-400"}`
            },
            star
          )) }),
          /* @__PURE__ */ jsxs20("div", { className: "text-sm text-gray-400", children: [
            user.totalRatings,
            " rating",
            user.totalRatings !== 1 ? "s" : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx23("div", { className: "mt-3 flex justify-center", children: /* @__PURE__ */ jsxs20("div", { className: `px-3 py-1 rounded-full text-sm font-medium border ${getIntegrityBadgeStyle(user.integrityScore)}`, children: [
        integrityLevel,
        " Integrity"
      ] }) }),
      user.totalRatings > 0 && /* @__PURE__ */ jsx23("div", { className: "mt-4 pt-3 border-t border-violet-500/20", children: /* @__PURE__ */ jsxs20("div", { className: "text-xs text-gray-400 text-center", children: [
        "Based on ",
        user.totalRatings,
        " community rating",
        user.totalRatings !== 1 ? "s" : ""
      ] }) })
    ] }),
    /* @__PURE__ */ jsx23(
      IntegrityRatingModal,
      {
        isOpen: showRatingModal,
        onClose: () => setShowRatingModal(!1),
        targetUser: user,
        context,
        referenceId,
        referenceType
      }
    )
  ] });
}
function getIntegrityLevel(score) {
  return score >= 9 ? "Exceptional" : score >= 8 ? "Excellent" : score >= 7 ? "Good" : score >= 6 ? "Fair" : score >= 5 ? "Average" : score >= 4 ? "Below Average" : score >= 3 ? "Poor" : score >= 2 ? "Very Poor" : "Unacceptable";
}
function getIntegrityColor(score) {
  return score >= 8 ? "text-green-400" : score >= 6 ? "text-yellow-400" : score >= 4 ? "text-orange-400" : "text-red-400";
}
function getIntegrityBadgeStyle(score) {
  return score >= 8 ? "bg-green-500/20 text-green-400 border-green-500/50" : score >= 6 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" : score >= 4 ? "bg-orange-500/20 text-orange-400 border-orange-500/50" : "bg-red-500/20 text-red-400 border-red-500/50";
}

// app/routes/$username.tsx
init_schema();
import { eq as eq22, desc as desc9, inArray as inArray3, sql as sql9 } from "drizzle-orm";
import { jsx as jsx24, jsxs as jsxs21 } from "react/jsx-runtime";
var DEFAULT_PROFILE_PICTURE2 = "https://api.dicebear.com/7.x/initials/svg?seed=";
function getProfilePicture2(profilePicture, username) {
  return profilePicture || `${DEFAULT_PROFILE_PICTURE2}${username}`;
}
function truncateContent(content) {
  return content ? content.length > 100 ? content.substring(0, 100) + "..." : content : "";
}
function getActivityDescription2(action26) {
  return {
    POST_CREATED: "Created a new post",
    POST_UPVOTED: "Received an upvote on their post",
    POST_DOWNVOTED: "Received a downvote on their post",
    COMMENT_CREATED: "Added a comment",
    COMMENT_UPVOTED: "Received an upvote on their comment",
    COMMENT_DOWNVOTED: "Received a downvote on their comment",
    ANSWER_CREATED: "Provided an answer",
    ANSWER_UPVOTED: "Received an upvote on their answer",
    ANSWER_DOWNVOTED: "Received a downvote on their answer",
    ANSWER_ACCEPTED: "Their answer was accepted as the best solution",
    PROFILE_COMPLETED: "Completed their profile information",
    DAILY_LOGIN: "Logged in for the day",
    WEEKLY_STREAK: "Maintained a weekly activity streak",
    MONTHLY_CONTRIBUTOR: "Active contributor this month",
    HELPFUL_MEMBER: "Recognized as a helpful community member",
    FIRST_POST: "Created their first post",
    FIRST_ANSWER: "Provided their first answer",
    FIRST_COMMENT: "Added their first comment",
    REPUTATION_MILESTONE: "Reached a reputation milestone",
    COMMUNITY_ENGAGEMENT: "Active participation in the community",
    CREATE_POST: "Created a new post"
  }[action26] || action26;
}
var SocialMediaIcons = ({ profile }) => {
  let socialLinks = [
    { icon: FaGithub, url: profile.github, label: "GitHub", color: "hover:text-[#333]" },
    { icon: FaTwitter, url: profile.twitter, label: "Twitter", color: "hover:text-[#1DA1F2]" },
    { icon: FaLinkedin, url: profile.linkedin, label: "LinkedIn", color: "hover:text-[#0077B5]" },
    { icon: FaInstagram, url: profile.instagram, label: "Instagram", color: "hover:text-[#E4405F]" },
    { icon: FaFacebook, url: profile.facebook, label: "Facebook", color: "hover:text-[#1877F2]" },
    { icon: FaYoutube, url: profile.youtube, label: "YouTube", color: "hover:text-[#FF0000]" },
    { icon: FaTiktok, url: profile.tiktok, label: "TikTok", color: "hover:text-[#000000]" },
    { icon: FaDiscord, url: profile.discord, label: "Discord", color: "hover:text-[#5865F2]" },
    { icon: FaReddit, url: profile.reddit, label: "Reddit", color: "hover:text-[#FF4500]" },
    { icon: FaMedium, url: profile.medium, label: "Medium", color: "hover:text-[#000000]" },
    { icon: FaStackOverflow, url: profile.stackoverflow, label: "Stack Overflow", color: "hover:text-[#F48024]" },
    { icon: FaDev, url: profile.devto, label: "Dev.to", color: "hover:text-[#0A0A0A]" }
  ].filter((link) => link.url);
  return socialLinks.length === 0 ? null : /* @__PURE__ */ jsx24("div", { className: "flex flex-wrap gap-4", children: socialLinks.map(({ icon: Icon, url, label, color }) => /* @__PURE__ */ jsx24(
    "a",
    {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: `text-gray-400 ${color} transition-colors p-2 rounded-lg hover:bg-white/10`,
      title: label,
      children: /* @__PURE__ */ jsx24(Icon, { className: "w-6 h-6" })
    },
    label
  )) });
};
async function loader17({ params, context, request }) {
  let { username } = params;
  if (!username)
    throw new Response("Username is required", { status: 400 });
  try {
    let db = context.env.DB, currentUser = await getUser(request), user = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      solanaAddress: users.solanaAddress,
      createdAt: users.createdAt,
      reputationPoints: users.reputationPoints,
      integrityScore: users.integrityScore,
      totalRatings: users.totalRatings,
      profile: {
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profilePicture: profiles.profilePicture,
        bio: profiles.bio,
        location: profiles.location,
        website: profiles.website,
        github: profiles.github
      }
    }).from(users).leftJoin(profiles, eq22(users.id, profiles.userId)).where(eq22(users.username, username)).limit(1);
    if (!user.length)
      throw new Response("User not found", { status: 404 });
    let userPosts = await db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      visibilityVotes: posts.visibilityVotes
    }).from(posts).where(eq22(posts.authorId, user[0].id)).orderBy(desc9(posts.createdAt)).limit(5), postIds = userPosts.map((post) => post.id), commentCounts = postIds.length > 0 ? await db.select({
      postId: comments.postId,
      count: sql9`count(${comments.id})`
    }).from(comments).where(inArray3(comments.postId, postIds)).groupBy(comments.postId) : [], userReputationHistory = await db.select({
      id: reputationHistory.id,
      points: reputationHistory.points,
      action: reputationHistory.action,
      createdAt: reputationHistory.createdAt
    }).from(reputationHistory).where(eq22(reputationHistory.userId, user[0].id)).orderBy(desc9(reputationHistory.createdAt)).limit(10), transformedPosts = userPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      visibilityVotes: post.visibilityVotes,
      comments: commentCounts.find((c) => c.postId === post.id)?.count || 0
    })), transformedReputationHistory = userReputationHistory.map((history) => ({
      id: history.id,
      points: history.points,
      action: history.action,
      createdAt: history.createdAt.toISOString()
    }));
    return json31({
      user: {
        ...user[0],
        posts: transformedPosts,
        reputationHistory: transformedReputationHistory
      },
      currentUser
    });
  } catch (error) {
    throw console.error("Error fetching user:", error), new Response("Failed to fetch user", { status: 500 });
  }
}
function UserProfile() {
  let { user, currentUser } = useLoaderData11(), reputationLevel = getReputationLevel(user.reputationPoints), profilePicture = getProfilePicture2(user.profile?.profilePicture || null, user.username);
  return /* @__PURE__ */ jsxs21("div", { className: "h-screen w-full bg-neutral-900/95 flex flex-row", children: [
    /* @__PURE__ */ jsx24(Nav, {}),
    /* @__PURE__ */ jsx24("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxs21("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16", children: [
      /* @__PURE__ */ jsx24("div", { className: "mb-6 flex justify-between items-center mt-16", children: /* @__PURE__ */ jsxs21("h1", { className: "text-2xl font-bold text-white", children: [
        "Profile: ",
        user.username
      ] }) }),
      /* @__PURE__ */ jsxs21("div", { className: "bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]", children: [
        /* @__PURE__ */ jsxs21("div", { className: "flex items-start space-x-6", children: [
          /* @__PURE__ */ jsx24("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx24(
            "img",
            {
              src: profilePicture,
              alt: `${user.username}'s profile`,
              className: "w-24 h-24 rounded-full border-2 border-violet-500/50"
            }
          ) }),
          /* @__PURE__ */ jsxs21("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx24("h2", { className: "text-xl font-semibold text-white", children: user.username }),
            /* @__PURE__ */ jsxs21("p", { className: "text-gray-400 mt-1", children: [
              "Member since ",
              new Date(user.createdAt).toLocaleDateString()
            ] }),
            /* @__PURE__ */ jsx24("div", { className: "mt-4", children: /* @__PURE__ */ jsxs21("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx24("div", { className: "bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50", children: /* @__PURE__ */ jsx24("span", { className: "text-violet-300 font-medium", children: reputationLevel }) }),
              /* @__PURE__ */ jsx24("div", { className: "bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50", children: /* @__PURE__ */ jsxs21("span", { className: "text-violet-300 font-medium", children: [
                user.reputationPoints,
                " points"
              ] }) })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs21("div", { className: "mt-8", children: [
          /* @__PURE__ */ jsx24("h2", { className: "text-lg font-semibold text-violet-300 mb-4", children: "Profile Information" }),
          /* @__PURE__ */ jsxs21("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs21("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
              /* @__PURE__ */ jsx24("label", { className: "block text-sm font-medium text-violet-300", children: "Bio" }),
              /* @__PURE__ */ jsx24("p", { className: "mt-1 text-sm text-gray-300", children: user.profile?.bio || "No bio provided" })
            ] }),
            /* @__PURE__ */ jsxs21("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
              /* @__PURE__ */ jsx24("label", { className: "block text-sm font-medium text-violet-300", children: "Location" }),
              /* @__PURE__ */ jsx24("p", { className: "mt-1 text-sm text-gray-300", children: user.profile?.location || "No location provided" })
            ] }),
            /* @__PURE__ */ jsxs21("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
              /* @__PURE__ */ jsx24("label", { className: "block text-sm font-medium text-violet-300", children: "Website" }),
              /* @__PURE__ */ jsx24("p", { className: "mt-1 text-sm text-gray-300", children: user.profile?.website ? /* @__PURE__ */ jsx24(
                "a",
                {
                  href: user.profile.website,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-violet-400 hover:text-violet-300",
                  children: user.profile.website
                }
              ) : "No website provided" })
            ] }),
            /* @__PURE__ */ jsxs21("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
              /* @__PURE__ */ jsx24("label", { className: "block text-sm font-medium text-violet-300", children: "Social Media" }),
              /* @__PURE__ */ jsx24("div", { className: "mt-2", children: user.profile ? /* @__PURE__ */ jsx24(SocialMediaIcons, { profile: user.profile }) : /* @__PURE__ */ jsx24("p", { className: "text-sm text-gray-300", children: "No social media links provided" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx24("div", { className: "mt-8", children: /* @__PURE__ */ jsx24(
          IntegrityDisplay,
          {
            user: {
              id: user.id,
              username: user.username,
              integrityScore: user.integrityScore,
              totalRatings: user.totalRatings
            },
            currentUserId: currentUser?.id,
            canRate: !0
          }
        ) }),
        /* @__PURE__ */ jsxs21("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs21("div", { children: [
            /* @__PURE__ */ jsx24("h2", { className: "text-lg font-semibold text-violet-300 mb-4", children: "Recent Activity" }),
            /* @__PURE__ */ jsx24("div", { className: "space-y-2", children: user.reputationHistory.length > 0 ? user.reputationHistory.map((history) => /* @__PURE__ */ jsxs21("div", { className: "flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30", children: [
              /* @__PURE__ */ jsxs21("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx24("div", { className: "p-1.5 bg-violet-500/20 rounded-lg", children: /* @__PURE__ */ jsx24(FiThumbsUp3, { className: "w-3.5 h-3.5 text-violet-300" }) }),
                /* @__PURE__ */ jsxs21("div", { children: [
                  /* @__PURE__ */ jsx24("p", { className: "text-sm font-medium text-violet-300", children: getActivityDescription2(history.action) }),
                  /* @__PURE__ */ jsx24("p", { className: "text-xs text-gray-400 mt-0.5", children: new Date(history.createdAt).toLocaleDateString() })
                ] })
              ] }),
              /* @__PURE__ */ jsxs21("span", { className: `text-sm font-medium ${history.points > 0 ? "text-green-400" : "text-red-400"}`, children: [
                history.points > 0 ? "+" : "",
                history.points
              ] })
            ] }, history.id)) : /* @__PURE__ */ jsx24("div", { className: "text-center py-4", children: /* @__PURE__ */ jsx24("p", { className: "text-gray-500", children: "No recent activity" }) }) })
          ] }),
          /* @__PURE__ */ jsxs21("div", { children: [
            /* @__PURE__ */ jsx24("h2", { className: "text-lg font-semibold text-violet-300 mb-4", children: "Recent Posts" }),
            /* @__PURE__ */ jsx24("div", { className: "space-y-2", children: user.posts.length > 0 ? user.posts.map((post) => /* @__PURE__ */ jsx24("div", { className: "p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30", children: /* @__PURE__ */ jsxs21(Link11, { to: `/posts/${post.id}`, className: "block hover:bg-neutral-600/50 rounded-lg p-1.5 -m-1.5 transition-colors", children: [
              /* @__PURE__ */ jsxs21("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx24("div", { className: "p-1.5 bg-violet-500/20 rounded-lg", children: /* @__PURE__ */ jsx24(FiEdit23, { className: "w-3.5 h-3.5 text-violet-300" }) }),
                /* @__PURE__ */ jsx24("h3", { className: "text-sm font-medium text-violet-300", children: post.title })
              ] }),
              /* @__PURE__ */ jsx24("p", { className: "text-xs text-gray-300 line-clamp-2", children: truncateContent(post.content) }),
              /* @__PURE__ */ jsxs21("div", { className: "mt-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx24("p", { className: "text-xs text-gray-400", children: new Date(post.createdAt).toLocaleDateString() }),
                /* @__PURE__ */ jsxs21("div", { className: "flex items-center space-x-2 text-xs text-gray-400", children: [
                  /* @__PURE__ */ jsxs21("span", { children: [
                    "\u{1F441}\uFE0F ",
                    post.visibilityVotes
                  ] }),
                  /* @__PURE__ */ jsxs21("span", { children: [
                    "\u{1F4AC} ",
                    post.comments
                  ] })
                ] })
              ] })
            ] }) }, post.id)) : /* @__PURE__ */ jsx24("div", { className: "text-center py-4", children: /* @__PURE__ */ jsx24("p", { className: "text-gray-500", children: "No posts yet" }) }) })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}

// app/routes/community.tsx
var community_exports = {};
__export(community_exports, {
  action: () => action21,
  default: () => Community,
  loader: () => loader18,
  meta: () => meta4
});
import { useEffect as useEffect10, useState as useState14 } from "react";
import { useLoaderData as useLoaderData12, Link as Link12, useSubmit as useSubmit4, useNavigate as useNavigate4, useSearchParams as useSearchParams3 } from "@remix-run/react";
import { json as json32 } from "@remix-run/node";
init_schema();
import { eq as eq23, and as and16, desc as desc10, sql as sql10, or as or3 } from "drizzle-orm";
import { FiTrendingUp } from "react-icons/fi";
import { FaSearch, FaBookmark } from "react-icons/fa";
import { jsx as jsx25, jsxs as jsxs22 } from "react/jsx-runtime";
var DEFAULT_PROFILE_PICTURE3 = "https://api.dicebear.com/7.x/initials/svg?seed=";
function getProfilePicture3(profilePicture, username) {
  return profilePicture || `${DEFAULT_PROFILE_PICTURE3}${encodeURIComponent(username)}`;
}
var meta4 = () => [
  { title: "Community - portal.ask" },
  { name: "description", content: "Explore the portal.ask community and discover questions, answers, and discussions" }
], loader18 = async ({ request, context }) => {
  try {
    let user = await getUser(request), db = context.env.DB, url = new URL(request.url), page = parseInt(url.searchParams.get("page") || "1"), selectedTags = url.searchParams.get("tags")?.split(",").filter(Boolean) || [], searchQuery = url.searchParams.get("search") || "", perPage = 20, skip = (page - 1) * perPage, whereConditions = [];
    selectedTags.length > 0 && whereConditions.push(sql10`EXISTS (
        SELECT 1 FROM post_tags pt 
        JOIN tags t ON pt.tag_id = t.id 
        WHERE pt.post_id = posts.id AND t.name IN (${selectedTags.join(",")})
      )`), searchQuery && whereConditions.push(
      or3(
        sql10`posts.title LIKE ${`%${searchQuery}%`}`,
        sql10`posts.content LIKE ${`%${searchQuery}%`}`
      )
    );
    let baseQuery = db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      visibilityVotes: posts.visibilityVotes,
      qualityUpvotes: posts.qualityUpvotes,
      qualityDownvotes: posts.qualityDownvotes,
      hasBounty: posts.hasBounty,
      status: posts.status
    }).from(posts).orderBy(desc10(posts.createdAt)).limit(perPage).offset(skip), postsData = await (whereConditions.length > 0 ? baseQuery.where(and16(...whereConditions)) : baseQuery), postsWithData = await Promise.all(
      postsData.map(async (post) => {
        let author = (await db.select({
          id: users.id,
          username: users.username
        }).from(users).where(eq23(users.id, post.authorId)).limit(1))[0] || { id: "", username: "Unknown" }, profilePicture = (await db.select({
          profilePicture: profiles.profilePicture
        }).from(profiles).where(eq23(profiles.userId, post.authorId)).limit(1))[0]?.profilePicture || null, postTagsArr = await db.select({
          tagId: postTags.tagId
        }).from(postTags).where(eq23(postTags.postId, post.id)), tagNames = await Promise.all(
          postTagsArr.map(async (pt) => (await db.select({
            id: tags.id,
            name: tags.name,
            color: tags.color
          }).from(tags).where(eq23(tags.id, pt.tagId)).limit(1))[0] || null)
        ), commentsCount = (await db.select({ count: sql10`count(*)` }).from(comments).where(eq23(comments.postId, post.id)))[0]?.count || 0, bounty = null;
        return post.hasBounty && (bounty = (await db.select({
          id: bounties.id,
          amount: bounties.amount,
          status: bounties.status
        }).from(bounties).where(eq23(bounties.postId, post.id)).limit(1))[0] || null), {
          ...post,
          author: {
            id: author.id,
            username: author.username,
            profilePicture
          },
          tags: tagNames.filter(Boolean),
          comments: commentsCount,
          hasBounty: post.hasBounty,
          bounty
        };
      })
    ), totalCount = (await db.select({ count: sql10`count(*)` }).from(posts))[0]?.count || 0;
    return json32({
      posts: postsWithData,
      totalPosts: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / perPage),
      availableTags: [],
      // TODO: implement tag fetching if needed
      selectedTags,
      searchQuery,
      user
    });
  } catch (error) {
    return console.error("Error loading community posts:", error), json32({
      posts: [],
      totalPosts: 0,
      currentPage: 1,
      totalPages: 1,
      availableTags: [],
      selectedTags: [],
      searchQuery: "",
      user: null
    });
  }
}, action21 = async ({ request, context }) => {
  try {
    let user = await getUser(request);
    if (!user)
      return json32({ error: "You must be logged in to perform this action" }, { status: 401 });
    let db = createDb(context.env.DB), formData = await request.formData(), action26 = formData.get("action"), postIdRaw = formData.get("postId"), postId = typeof postIdRaw == "string" ? postIdRaw : void 0, isVoting = formData.get("isVoting") === "true";
    if (!postId)
      return json32({ error: "Post ID is required" }, { status: 400 });
    if (action26 === "vote")
      try {
        let result = await db.transaction(async (tx) => {
          await tx.delete(votes).where(and16(
            eq23(votes.userId, user.id),
            eq23(votes.postId, postId),
            eq23(votes.voteType, "POST"),
            eq23(votes.isQualityVote, !1)
          )), isVoting && await tx.insert(votes).values({
            id: crypto.randomUUID(),
            userId: user.id,
            postId,
            value: 1,
            voteType: "POST",
            isQualityVote: !1,
            commentId: null,
            answerId: null
          });
          let visibilityVotes = (await tx.select({ count: sql10`count(*)` }).from(votes).where(and16(
            eq23(votes.postId, postId),
            eq23(votes.voteType, "POST"),
            eq23(votes.isQualityVote, !1),
            eq23(votes.value, 1)
          )))[0]?.count || 0;
          return {
            post: (await tx.update(posts).set({
              visibilityVotes
            }).where(eq23(posts.id, postId)).returning())[0],
            userVoted: isVoting
          };
        });
        return json32({
          success: !0,
          votes: result.post.visibilityVotes,
          voted: result.userVoted,
          postId
        });
      } catch (error) {
        return json32({
          error: "Failed to process vote",
          details: error instanceof Error ? error.message : "Unknown error"
        }, 500);
      }
    else if (action26 === "delete") {
      let post = (await db.select().from(posts).where(eq23(posts.id, postId)).limit(1))[0];
      return post ? post.authorId !== user.id ? json32({ error: "You can only delete your own posts" }, { status: 403 }) : (await db.delete(posts).where(eq23(posts.id, postId)), json32({ success: !0 })) : json32({ error: "Post not found" }, { status: 404 });
    }
    return json32({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return console.error("Action error:", error), json32({
      error: "Failed to process action",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};
function Community() {
  let { user, posts: initialPosts, totalPosts, currentPage, totalPages, availableTags, selectedTags, searchQuery } = useLoaderData12(), [searchParams, setSearchParams] = useSearchParams3(), [localPosts, setLocalPosts] = useState14(initialPosts), [videoErrors, setVideoErrors] = useState14({}), [localSearchQuery, setLocalSearchQuery] = useState14(searchQuery), [isSearching, setIsSearching] = useState14(!1), submit = useSubmit4(), navigate = useNavigate4(), [isSubmitting, setIsSubmitting] = useState14(!1), [error, setError] = useState14(null), [bookmarkedPosts, setBookmarkedPosts] = useState14({});
  useEffect10(() => {
    console.log("Setting localPosts from initialPosts:", initialPosts.length), setLocalPosts(initialPosts);
  }, [initialPosts]), useEffect10(() => {
    setLocalSearchQuery(searchQuery), setIsSearching(!1);
  }, [searchQuery]), useEffect10(() => {
    let timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setIsSearching(!0);
        let newParams = new URLSearchParams(searchParams);
        localSearchQuery.trim() ? newParams.set("search", localSearchQuery) : newParams.delete("search"), newParams.set("page", "1"), setSearchParams(newParams);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, searchParams, setSearchParams]), useEffect10(() => {
  }, [bookmarkedPosts]), useEffect10(() => {
    if (!user || localPosts.length === 0)
      return;
    (async () => {
      try {
        let postIdsParam = encodeURIComponent(JSON.stringify(localPosts.map((p) => p.id))), res = await fetch(`/api/bookmarks-status?postIds=${postIdsParam}`, {
          method: "GET",
          headers: {
            Accept: "application/json"
          }
        });
        if (res.status === 401)
          return;
        if (!res.ok) {
          console.error("Failed to fetch bookmark status:", res.status, res.statusText);
          return;
        }
        let contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Response is not JSON:", contentType);
          return;
        }
        let data = await res.json();
        setBookmarkedPosts(data.status);
      } catch (error2) {
        console.error("Error fetching bookmark status:", error2);
      }
    })();
  }, [user, localPosts]);
  let handleVideoError = (postId, error2) => {
    setVideoErrors((prev) => ({ ...prev, [postId]: error2 }));
  }, handleVote = async (postId, voteValue) => {
    if (!user) {
      setError("Please log in to vote");
      return;
    }
    try {
      if (isSubmitting)
        return;
      setIsSubmitting(!0), setError(null);
      let formData = new FormData();
      formData.append("action", "vote"), formData.append("postId", postId), formData.append("isVoting", (voteValue === 1).toString()), submit(formData, { method: "post" });
    } catch (error2) {
      setError(error2 instanceof Error ? error2.message : "Failed to process vote");
    } finally {
      setIsSubmitting(!1);
    }
  }, handleBookmark = async (postId) => {
    if (user) {
      setBookmarkedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
      try {
        let response = await fetch("/api/bookmarks-toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId })
        });
        response.ok || (console.error("Failed to toggle bookmark:", response.status), setBookmarkedPosts((prev) => ({ ...prev, [postId]: !prev[postId] })));
      } catch (error2) {
        console.error("Error toggling bookmark:", error2), setBookmarkedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
      }
    }
  };
  return !initialPosts || !Array.isArray(initialPosts) ? /* @__PURE__ */ jsx25(Layout, { children: /* @__PURE__ */ jsx25("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 pb-16", children: /* @__PURE__ */ jsx25("div", { className: "text-red-500 mt-16", children: "Failed to load posts. Please try refreshing the page." }) }) }) : /* @__PURE__ */ jsx25(Layout, { children: /* @__PURE__ */ jsxs22("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 pb-16", children: [
    /* @__PURE__ */ jsxs22("div", { className: "mb-6 flex justify-between items-center mt-16", children: [
      /* @__PURE__ */ jsx25("h1", { className: "text-2xl font-bold text-white", children: "Community Posts" }),
      /* @__PURE__ */ jsx25(
        Link12,
        {
          to: "/posts/create",
          className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2",
          children: /* @__PURE__ */ jsx25("span", { children: "Create Post" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs22("div", { className: "mb-6 bg-neutral-800/50 rounded-lg p-4 border border-violet-500/30", children: [
      /* @__PURE__ */ jsxs22("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsxs22("div", { className: "flex-1 relative", children: [
          /* @__PURE__ */ jsx25(FaSearch, { className: `absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isSearching ? "text-violet-400 animate-pulse" : "text-gray-400"}` }),
          /* @__PURE__ */ jsx25(
            "input",
            {
              type: "text",
              placeholder: "Search posts by title...",
              value: localSearchQuery,
              onChange: (e) => {
                setLocalSearchQuery(e.target.value);
              },
              className: "w-full pl-10 pr-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            }
          )
        ] }),
        localSearchQuery && /* @__PURE__ */ jsx25(
          "button",
          {
            onClick: () => {
              setLocalSearchQuery("");
              let newParams = new URLSearchParams(searchParams);
              newParams.delete("search"), newParams.set("page", "1"), setSearchParams(newParams);
            },
            className: "px-3 py-2 text-gray-400 hover:text-white transition-colors",
            children: "Clear"
          }
        )
      ] }),
      searchQuery && /* @__PURE__ */ jsxs22("div", { className: "mt-2 text-sm text-gray-400", children: [
        'Searching for: "',
        searchQuery,
        '" \u2022 ',
        totalPosts,
        " result",
        totalPosts !== 1 ? "s" : "",
        " found",
        isSearching && /* @__PURE__ */ jsx25("span", { className: "ml-2 text-violet-400", children: "(searching...)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs22("div", { className: "mb-6 bg-neutral-800/50 rounded-lg p-4 border border-violet-500/30", children: [
      /* @__PURE__ */ jsxs22("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx25("h3", { className: "text-lg font-semibold text-violet-300", children: "Filter by Tags" }),
        selectedTags.length > 0 && /* @__PURE__ */ jsx25(
          "button",
          {
            onClick: () => setSearchParams({}),
            className: "text-sm text-gray-400 hover:text-white transition-colors",
            children: "Clear Filters"
          }
        )
      ] }),
      /* @__PURE__ */ jsx25("div", { className: "flex flex-wrap gap-2", children: availableTags.map((tag) => /* @__PURE__ */ jsx25(
        "button",
        {
          onClick: () => {
            let newParams = new URLSearchParams(searchParams), currentTags = newParams.getAll("tags");
            currentTags.includes(tag.id) ? (newParams.delete("tags"), currentTags.filter((t) => t !== tag.id).forEach((t) => newParams.append("tags", t))) : newParams.append("tags", tag.id), newParams.set("page", "1"), setSearchParams(newParams);
          },
          className: `px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${selectedTags.includes(tag.id) ? "bg-violet-500 text-white shadow-lg" : "bg-neutral-700/50 text-gray-300 hover:bg-neutral-600/50 border border-violet-500/30"}`,
          style: {
            borderColor: selectedTags.includes(tag.id) ? tag.color : void 0
          },
          children: tag.name
        },
        tag.id
      )) }),
      selectedTags.length > 0 && /* @__PURE__ */ jsxs22("div", { className: "mt-3 text-sm text-gray-400", children: [
        "Showing posts with: ",
        selectedTags.map((tagId) => availableTags.find((t) => t.id === tagId)?.name).filter(Boolean).join(", ")
      ] })
    ] }),
    /* @__PURE__ */ jsx25("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4", children: localPosts.length > 0 ? localPosts.map((post) => /* @__PURE__ */ jsxs22(
      "div",
      {
        className: `bg-neutral-800/80 rounded-lg p-6 border-2 shadow-lg relative ${post.hasBounty && post.bounty && post.bounty.status === "ACTIVE" ? "border-cyan-400/60 shadow-cyan-400/20 shadow-lg" : "border-violet-500/50 shadow-violet-500/20"}`,
        children: [
          post.hasBounty && post.bounty && post.bounty.status === "ACTIVE" && /* @__PURE__ */ jsx25("div", { className: "absolute top-4 right-4 z-10", children: /* @__PURE__ */ jsxs22("div", { className: "px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-semibold rounded-full border border-cyan-400/40", children: [
            "\u{1F4B0} ",
            post.bounty.amount,
            " PORTAL"
          ] }) }),
          /* @__PURE__ */ jsxs22("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxs22("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx25(
                "img",
                {
                  src: post.author.profilePicture || getProfilePicture3(null, post.author.username),
                  alt: `${post.author.username}'s avatar`,
                  className: "w-8 h-8 rounded-full"
                }
              ),
              /* @__PURE__ */ jsx25(
                Link12,
                {
                  to: `/${post.author.username}`,
                  className: "font-semibold text-violet-400 hover:text-violet-300 transition-colors",
                  onClick: (e) => e.stopPropagation(),
                  children: post.author.username
                }
              ),
              /* @__PURE__ */ jsx25("span", { className: "text-gray-400", children: new Date(post.createdAt).toLocaleDateString() })
            ] }),
            user && /* @__PURE__ */ jsx25(
              "button",
              {
                onClick: () => handleBookmark(post.id),
                className: `p-2 rounded-full transition-colors ${bookmarkedPosts[post.id] ? "bg-yellow-400/20 text-yellow-400" : "bg-neutral-700/50 text-gray-400 hover:text-yellow-400"}`,
                title: bookmarkedPosts[post.id] ? "Remove Bookmark" : "Bookmark",
                children: /* @__PURE__ */ jsx25(FaBookmark, { className: `w-4 h-4 ${bookmarkedPosts[post.id] ? "fill-current" : "fill-none"}` })
              }
            )
          ] }),
          /* @__PURE__ */ jsx25("div", { className: "group", children: /* @__PURE__ */ jsxs22(
            Link12,
            {
              to: `/posts/${post.id}`,
              className: "block",
              children: [
                /* @__PURE__ */ jsx25("h2", { className: "text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors", children: post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title }),
                /* @__PURE__ */ jsx25("p", { className: "text-gray-300 mb-4 overflow-hidden truncate max-w-full w-full break-words", children: post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content }),
                post.tags && post.tags.length > 0 && /* @__PURE__ */ jsx25("div", { className: "flex flex-wrap gap-1 mb-4", children: post.tags.map((tag) => /* @__PURE__ */ jsx25(
                  "span",
                  {
                    className: "px-2 py-1 text-xs font-medium rounded-full",
                    style: {
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      border: `1px solid ${tag.color}40`
                    },
                    children: tag.name
                  },
                  tag.id
                )) }),
                post.media && /* @__PURE__ */ jsxs22("div", { className: "mb-4", children: [
                  post.media.type.toLowerCase() === "image" && /* @__PURE__ */ jsx25(
                    "img",
                    {
                      src: post.media.url,
                      alt: "Post media",
                      className: "w-full h-48 object-cover rounded-lg"
                    }
                  ),
                  (post.media.type.toLowerCase() === "video" || post.media.type.toLowerCase() === "screen") && /* @__PURE__ */ jsx25(
                    "video",
                    {
                      src: post.media.url,
                      poster: post.media.thumbnailUrl,
                      controls: !0,
                      className: "w-full h-48 object-cover rounded-lg",
                      onError: (e) => handleVideoError(post.id, e.currentTarget.error?.message || "Video error")
                    }
                  )
                ] })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs22("div", { className: "flex items-center justify-between mt-4", children: [
            /* @__PURE__ */ jsxs22("div", { className: "flex items-center space-x-4", children: [
              /* @__PURE__ */ jsxs22(
                "button",
                {
                  onClick: () => handleVote(post.id, post.userVoted ? 0 : 1),
                  className: `flex items-center space-x-1 transition-colors ${post.userVoted ? "text-violet-400" : "text-gray-400 hover:text-violet-400"}`,
                  children: [
                    /* @__PURE__ */ jsx25(FiTrendingUp, { className: `w-5 h-5 ${post.userVoted ? "fill-current" : "fill-none"}` }),
                    /* @__PURE__ */ jsx25("span", { children: post.visibilityVotes })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs22("span", { className: "text-gray-400", children: [
                post.comments,
                " ",
                post.comments === 1 ? "comment" : "comments"
              ] })
            ] }),
            user && user.id !== post.author.id && /* @__PURE__ */ jsx25(
              IntegrityRatingButton,
              {
                targetUser: post.author,
                context: post.hasBounty ? "BOUNTY_REJECTION" : "GENERAL",
                referenceId: post.id,
                referenceType: "POST",
                variant: "icon",
                className: "ml-2"
              }
            )
          ] })
        ]
      },
      post.id
    )) : /* @__PURE__ */ jsx25("div", { className: "col-span-full text-center py-12", children: /* @__PURE__ */ jsx25("p", { className: "text-gray-500", children: "No posts found" }) }) }),
    totalPages > 1 && /* @__PURE__ */ jsxs22("div", { className: "flex justify-center mt-8 space-x-2", children: [
      /* @__PURE__ */ jsx25(
        "button",
        {
          onClick: () => {
            let newParams = new URLSearchParams(searchParams);
            newParams.set("page", String(currentPage - 1)), setSearchParams(newParams);
          },
          disabled: currentPage === 1,
          className: "px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50",
          children: "Previous"
        }
      ),
      Array.from({ length: totalPages }, (_, i) => /* @__PURE__ */ jsx25(
        "button",
        {
          onClick: () => {
            let newParams = new URLSearchParams(searchParams);
            newParams.set("page", String(i + 1)), setSearchParams(newParams);
          },
          className: `px-3 py-1 rounded ${currentPage === i + 1 ? "bg-violet-500 text-white" : "bg-gray-700 text-white"}`,
          children: i + 1
        },
        i + 1
      )),
      /* @__PURE__ */ jsx25(
        "button",
        {
          onClick: () => {
            let newParams = new URLSearchParams(searchParams);
            newParams.set("page", String(currentPage + 1)), setSearchParams(newParams);
          },
          disabled: currentPage === totalPages,
          className: "px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50",
          children: "Next"
        }
      )
    ] })
  ] }) });
}

// app/routes/settings.tsx
var settings_exports = {};
__export(settings_exports, {
  action: () => action22,
  default: () => Settings,
  loader: () => loader19,
  meta: () => meta5
});
import { useLoaderData as useLoaderData13, useActionData as useActionData5, useNavigation as useNavigation3, useFetcher as useFetcher3 } from "@remix-run/react";
import { json as json33 } from "@remix-run/node";
import { useEffect as useEffect11, useState as useState15 } from "react";

// app/components/auth-notice.tsx
import { Link as Link13 } from "@remix-run/react";
import { jsx as jsx26, jsxs as jsxs23 } from "react/jsx-runtime";
function AuthNotice() {
  return /* @__PURE__ */ jsxs23("div", { className: "h-screen w-full bg-neutral-900 flex flex-row", children: [
    /* @__PURE__ */ jsx26(Nav, {}),
    /* @__PURE__ */ jsx26("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs23("div", { className: "bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4", children: [
      /* @__PURE__ */ jsx26("h2", { className: "text-2xl font-bold text-white mb-4 text-center", children: "Sign In Required" }),
      /* @__PURE__ */ jsx26("p", { className: "text-gray-300 mb-6 text-center", children: "You must be signed in to access this page. If you don't have an account, you can create one for free." }),
      /* @__PURE__ */ jsxs23("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsx26(
          Link13,
          {
            to: "/login",
            className: "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center transition-colors",
            children: "Sign In"
          }
        ),
        /* @__PURE__ */ jsx26(
          Link13,
          {
            to: "/signup",
            className: "w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded text-center transition-colors",
            children: "Create Account"
          }
        )
      ] })
    ] }) })
  ] });
}

// app/routes/settings.tsx
init_schema();
import { FiUser, FiLink, FiMail, FiLock, FiSave, FiCheck as FiCheck2 } from "react-icons/fi";
import { eq as eq24 } from "drizzle-orm";
import { jsx as jsx27, jsxs as jsxs24 } from "react/jsx-runtime";
var meta5 = () => [
  { title: "Settings - portal.ask" },
  { name: "description", content: "Manage your portal.ask account settings" }
];
async function loader19({ request, context }) {
  let user = await getUser(request);
  if (!user)
    throw new Response("Unauthorized", { status: 401 });
  try {
    let userData = await context.env.DB.select({
      id: users.id,
      username: users.username,
      email: users.email,
      solanaAddress: users.solanaAddress,
      createdAt: users.createdAt,
      reputationPoints: users.reputationPoints,
      integrityScore: users.integrityScore,
      totalRatings: users.totalRatings,
      profile: {
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profilePicture: profiles.profilePicture,
        bio: profiles.bio,
        location: profiles.location,
        website: profiles.website,
        facebook: profiles.facebook,
        twitter: profiles.twitter,
        instagram: profiles.instagram,
        linkedin: profiles.linkedin,
        github: profiles.github,
        youtube: profiles.youtube,
        tiktok: profiles.tiktok,
        discord: profiles.discord,
        reddit: profiles.reddit,
        medium: profiles.medium,
        stackoverflow: profiles.stackoverflow,
        devto: profiles.devto
      }
    }).from(users).leftJoin(profiles, eq24(users.id, profiles.userId)).where(eq24(users.id, user.id)).limit(1);
    if (!userData.length)
      throw new Response("User not found", { status: 404 });
    return json33({ user: userData[0] });
  } catch (error) {
    throw console.error("Error fetching user data:", error), new Response("Failed to fetch user data", { status: 500 });
  }
}
async function action22({ request, context }) {
  let user = await getUser(request);
  if (!user)
    throw new Response("Unauthorized", { status: 401 });
  let formData = await request.formData(), action26 = formData.get("action");
  try {
    let db = context.env.DB;
    switch (action26) {
      case "updateProfile": {
        let firstName = formData.get("firstName"), lastName = formData.get("lastName"), bio = formData.get("bio"), location = formData.get("location"), website = formData.get("website"), facebook = formData.get("facebook"), twitter = formData.get("twitter"), instagram = formData.get("instagram"), linkedin = formData.get("linkedin"), github = formData.get("github"), youtube = formData.get("youtube"), tiktok = formData.get("tiktok"), discord = formData.get("discord"), reddit = formData.get("reddit"), medium = formData.get("medium"), stackoverflow = formData.get("stackoverflow"), devto = formData.get("devto");
        return (await db.select().from(profiles).where(eq24(profiles.userId, user.id)).limit(1)).length > 0 ? await db.update(profiles).set({
          firstName,
          lastName,
          bio,
          location,
          website,
          facebook,
          twitter,
          instagram,
          linkedin,
          github,
          youtube,
          tiktok,
          discord,
          reddit,
          medium,
          stackoverflow,
          devto,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq24(profiles.userId, user.id)) : await db.insert(profiles).values({
          id: crypto.randomUUID(),
          userId: user.id,
          firstName,
          lastName,
          bio,
          location,
          website,
          facebook,
          twitter,
          instagram,
          linkedin,
          github,
          youtube,
          tiktok,
          discord,
          reddit,
          medium,
          stackoverflow,
          devto,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }), json33({ success: !0, message: "Profile updated successfully" });
      }
      default:
        return json33({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return console.error("Error updating profile:", error), json33({ error: "Failed to update profile" }, { status: 500 });
  }
}
function Settings() {
  let { userData, isAuthenticated } = useLoaderData13(), actionData = useActionData5(), navigation = useNavigation3(), [activeTab, setActiveTab] = useState15("profile"), [showSuccess, setShowSuccess] = useState15(!1), isSubmitting = navigation.state === "submitting", fetcher = useFetcher3();
  return useEffect11(() => {
    if (fetcher.data?.success) {
      setShowSuccess(!0);
      let timer = setTimeout(() => setShowSuccess(!1), 3e3);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]), isAuthenticated ? /* @__PURE__ */ jsx27(Layout, { children: /* @__PURE__ */ jsxs24("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 pb-16", children: [
    /* @__PURE__ */ jsx27("div", { className: "mb-6 flex justify-between items-center mt-16", children: /* @__PURE__ */ jsx27("h1", { className: "text-2xl font-bold text-white", children: "Settings" }) }),
    showSuccess && /* @__PURE__ */ jsxs24("div", { className: "mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400", children: [
      /* @__PURE__ */ jsx27(FiCheck2, { className: "w-5 h-5" }),
      /* @__PURE__ */ jsx27("span", { children: "Changes saved successfully!" })
    ] }),
    /* @__PURE__ */ jsxs24("div", { className: "bg-neutral-800/80 rounded-lg border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]", children: [
      /* @__PURE__ */ jsx27("div", { className: "flex border-b border-violet-500/30", children: [
        { id: "profile", label: "Profile", icon: FiUser },
        { id: "social", label: "Social Links", icon: FiLink },
        { id: "account", label: "Account", icon: FiMail },
        { id: "security", label: "Security", icon: FiLock }
      ].map((tab) => /* @__PURE__ */ jsxs24(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id ? "text-violet-400 border-b-2 border-violet-400" : "text-gray-400 hover:text-violet-300"}`,
          children: [
            /* @__PURE__ */ jsx27(tab.icon, { className: "w-5 h-5" }),
            tab.label
          ]
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsx27("div", { className: "p-6", children: /* @__PURE__ */ jsxs24(fetcher.Form, { method: "post", className: "space-y-6", children: [
        /* @__PURE__ */ jsx27("input", { type: "hidden", name: "action", value: "updateProfile" }),
        activeTab === "profile" && /* @__PURE__ */ jsxs24("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs24("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs24("div", { children: [
              /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "First Name" }),
              /* @__PURE__ */ jsx27(
                "input",
                {
                  type: "text",
                  name: "firstName",
                  defaultValue: userData.profile?.firstName || "",
                  placeholder: "Enter your first name",
                  className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs24("div", { children: [
              /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Last Name" }),
              /* @__PURE__ */ jsx27(
                "input",
                {
                  type: "text",
                  name: "lastName",
                  defaultValue: userData.profile?.lastName || "",
                  placeholder: "Enter your last name",
                  className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Bio" }),
            /* @__PURE__ */ jsx27(
              "textarea",
              {
                name: "bio",
                defaultValue: userData.profile?.bio || "",
                placeholder: "Tell us about yourself...",
                rows: 4,
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Location" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "location",
                defaultValue: userData.profile?.location || "",
                placeholder: "City, Country",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Website" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "url",
                name: "website",
                defaultValue: userData.profile?.website || "",
                placeholder: "https://your-website.com",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] })
        ] }),
        activeTab === "social" && /* @__PURE__ */ jsxs24("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Facebook" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "facebook",
                defaultValue: userData.profile?.facebook || "",
                placeholder: "facebook.com/username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Twitter" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "twitter",
                defaultValue: userData.profile?.twitter || "",
                placeholder: "@username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Instagram" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "instagram",
                defaultValue: userData.profile?.instagram || "",
                placeholder: "@username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "LinkedIn" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "linkedin",
                defaultValue: userData.profile?.linkedin || "",
                placeholder: "linkedin.com/in/username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "GitHub" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "github",
                defaultValue: userData.profile?.github || "",
                placeholder: "github.com/username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "YouTube" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "youtube",
                defaultValue: userData.profile?.youtube || "",
                placeholder: "youtube.com/@username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "TikTok" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "tiktok",
                defaultValue: userData.profile?.tiktok || "",
                placeholder: "@username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Discord" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "discord",
                defaultValue: userData.profile?.discord || "",
                placeholder: "username#0000",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Reddit" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "reddit",
                defaultValue: userData.profile?.reddit || "",
                placeholder: "u/username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Medium" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "medium",
                defaultValue: userData.profile?.medium || "",
                placeholder: "medium.com/@username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Stack Overflow" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "stackoverflow",
                defaultValue: userData.profile?.stackoverflow || "",
                placeholder: "stackoverflow.com/users/username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Dev.to" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                name: "devto",
                defaultValue: userData.profile?.devto || "",
                placeholder: "dev.to/username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] })
        ] }),
        activeTab === "account" && /* @__PURE__ */ jsxs24("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Email" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "email",
                value: userData.email,
                disabled: !0,
                placeholder: "Your email address",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-gray-400 cursor-not-allowed"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Username" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "text",
                value: userData.username,
                disabled: !0,
                placeholder: "Your username",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-gray-400 cursor-not-allowed"
              }
            )
          ] })
        ] }),
        activeTab === "security" && /* @__PURE__ */ jsxs24("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Current Password" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "password",
                name: "currentPassword",
                placeholder: "Enter your current password",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "New Password" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "password",
                name: "newPassword",
                placeholder: "Enter your new password",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs24("div", { children: [
            /* @__PURE__ */ jsx27("label", { className: "block text-sm font-medium text-violet-300 mb-2", children: "Confirm New Password" }),
            /* @__PURE__ */ jsx27(
              "input",
              {
                type: "password",
                name: "confirmPassword",
                placeholder: "Confirm your new password",
                className: "w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx27("div", { className: "flex justify-end pt-6 border-t border-violet-500/30", children: /* @__PURE__ */ jsxs24(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            children: [
              /* @__PURE__ */ jsx27(FiSave, { className: "w-5 h-5" }),
              isSubmitting ? "Saving..." : "Save Changes"
            ]
          }
        ) })
      ] }) })
    ] })
  ] }) }) : /* @__PURE__ */ jsx27(AuthNotice, {});
}

// app/routes/privacy.tsx
var privacy_exports = {};
__export(privacy_exports, {
  default: () => PrivacyPolicy,
  loader: () => loader20
});
import { json as json34 } from "@remix-run/node";
import { jsx as jsx28, jsxs as jsxs25 } from "react/jsx-runtime";
var loader20 = async ({ request }) => json34({});
function PrivacyPolicy() {
  return /* @__PURE__ */ jsx28(Layout, { showNav: !1, children: /* @__PURE__ */ jsxs25("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxs25("div", { className: "mb-6 flex justify-between items-center mt-16", children: [
      /* @__PURE__ */ jsx28("h1", { className: "text-3xl font-bold text-white", children: "Privacy Policy" }),
      /* @__PURE__ */ jsxs25("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxs25(
          "a",
          {
            href: "/api/privacy.pdf",
            className: "px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx28("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx28("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
              "Download PDF"
            ]
          }
        ),
        /* @__PURE__ */ jsxs25(
          "button",
          {
            onClick: () => window.print(),
            className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx28("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx28("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" }) }),
              "Print"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx28("div", { className: "bg-white text-gray-900 rounded-lg shadow-lg p-8 print:shadow-none", children: /* @__PURE__ */ jsxs25("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs25("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx28("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Privacy Policy" }),
        /* @__PURE__ */ jsxs25("p", { className: "text-gray-600", children: [
          "Last updated: ",
          (/* @__PURE__ */ new Date()).toLocaleDateString()
        ] })
      ] }),
      /* @__PURE__ */ jsxs25("div", { className: "space-y-6 text-sm leading-relaxed", children: [
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "1. Introduction" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: 'Welcome to portal.ask ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decentralized platform for knowledge sharing and community building.' }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "By using portal.ask, you consent to the data practices described in this policy." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "2. Information We Collect" }),
          /* @__PURE__ */ jsx28("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "2.1 Personal Information" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "We may collect the following personal information:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx28("li", { children: "Email address" }),
            /* @__PURE__ */ jsx28("li", { children: "Username" }),
            /* @__PURE__ */ jsx28("li", { children: "Profile information (bio, location, website)" }),
            /* @__PURE__ */ jsx28("li", { children: "Social media links" }),
            /* @__PURE__ */ jsx28("li", { children: "Profile picture" }),
            /* @__PURE__ */ jsx28("li", { children: "Solana wallet addresses" })
          ] }),
          /* @__PURE__ */ jsx28("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "2.2 Usage Information" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "We automatically collect certain information about your use of our platform:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx28("li", { children: "Posts, comments, and interactions" }),
            /* @__PURE__ */ jsx28("li", { children: "Voting and reputation data" }),
            /* @__PURE__ */ jsx28("li", { children: "Transaction history" }),
            /* @__PURE__ */ jsx28("li", { children: "IP address and device information" }),
            /* @__PURE__ */ jsx28("li", { children: "Browser type and version" }),
            /* @__PURE__ */ jsx28("li", { children: "Pages visited and time spent" })
          ] }),
          /* @__PURE__ */ jsx28("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "2.3 Blockchain Data" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "As a decentralized platform, some information may be stored on the Solana blockchain, which is publicly accessible and immutable." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "3. How We Use Your Information" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "We use the collected information for the following purposes:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx28("li", { children: "Provide and maintain our platform services" }),
            /* @__PURE__ */ jsx28("li", { children: "Process transactions and manage virtual wallets" }),
            /* @__PURE__ */ jsx28("li", { children: "Calculate and display reputation scores" }),
            /* @__PURE__ */ jsx28("li", { children: "Facilitate community interactions" }),
            /* @__PURE__ */ jsx28("li", { children: "Send important notifications and updates" }),
            /* @__PURE__ */ jsx28("li", { children: "Improve our platform and user experience" }),
            /* @__PURE__ */ jsx28("li", { children: "Comply with legal obligations" }),
            /* @__PURE__ */ jsx28("li", { children: "Prevent fraud and abuse" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "4. Information Sharing and Disclosure" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "We do not sell, trade, or rent your personal information to third parties. However, we may share your information in the following circumstances:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Public Content:" }),
              " Posts, comments, and public profile information are visible to all users"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Blockchain Transactions:" }),
              " Transaction data is publicly visible on the Solana blockchain"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Legal Requirements:" }),
              " When required by law or to protect our rights"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Service Providers:" }),
              " With trusted third-party service providers who assist in platform operations"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Consent:" }),
              " When you explicitly consent to sharing"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "5. Data Security" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "We implement appropriate security measures to protect your personal information:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx28("li", { children: "Encryption of sensitive data" }),
            /* @__PURE__ */ jsx28("li", { children: "Secure authentication systems" }),
            /* @__PURE__ */ jsx28("li", { children: "Regular security audits" }),
            /* @__PURE__ */ jsx28("li", { children: "Access controls and monitoring" }),
            /* @__PURE__ */ jsx28("li", { children: "Secure hosting infrastructure" })
          ] }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "6. Your Rights and Choices" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "You have the following rights regarding your personal information:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Access:" }),
              " Request access to your personal information"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Correction:" }),
              " Update or correct your information"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Deletion:" }),
              " Request deletion of your account and data"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Portability:" }),
              " Export your data in a machine-readable format"
            ] }),
            /* @__PURE__ */ jsxs25("li", { children: [
              /* @__PURE__ */ jsx28("strong", { children: "Opt-out:" }),
              " Unsubscribe from non-essential communications"
            ] })
          ] }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "Note: Some data stored on the blockchain may be immutable and cannot be deleted." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "7. Cookies and Tracking" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "We use cookies and similar technologies to:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx28("li", { children: "Maintain your session and preferences" }),
            /* @__PURE__ */ jsx28("li", { children: "Analyze platform usage and performance" }),
            /* @__PURE__ */ jsx28("li", { children: "Provide personalized content" }),
            /* @__PURE__ */ jsx28("li", { children: "Improve user experience" })
          ] }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "You can control cookie settings through your browser preferences." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "8. Third-Party Services" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "Our platform may integrate with third-party services:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx28("li", { children: "Solana blockchain network" }),
            /* @__PURE__ */ jsx28("li", { children: "Cloudinary for media storage" }),
            /* @__PURE__ */ jsx28("li", { children: "Authentication providers" }),
            /* @__PURE__ */ jsx28("li", { children: "Analytics services" })
          ] }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "These services have their own privacy policies, and we encourage you to review them." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "9. Children's Privacy" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "10. International Data Transfers" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "11. Changes to This Policy" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "We may update this Privacy Policy from time to time. We will notify you of any material changes by:" }),
          /* @__PURE__ */ jsxs25("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx28("li", { children: "Posting the updated policy on our platform" }),
            /* @__PURE__ */ jsx28("li", { children: "Sending email notifications to registered users" }),
            /* @__PURE__ */ jsx28("li", { children: "Displaying prominent notices on our website" })
          ] }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "Your continued use of the platform after changes become effective constitutes acceptance of the updated policy." })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "12. Contact Us" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700 mb-3", children: "If you have any questions about this Privacy Policy or our data practices, please contact us:" }),
          /* @__PURE__ */ jsxs25("div", { className: "bg-gray-50 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsxs25("p", { className: "text-gray-700 mb-2", children: [
              /* @__PURE__ */ jsx28("strong", { children: "Email:" }),
              " bountybucks524@gmail.com"
            ] }),
            /* @__PURE__ */ jsxs25("p", { className: "text-gray-700 mb-2", children: [
              /* @__PURE__ */ jsx28("strong", { children: "Platform:" }),
              " portal.ask"
            ] }),
            /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "We will respond to your inquiry within a reasonable timeframe." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs25("section", { children: [
          /* @__PURE__ */ jsx28("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "13. Governing Law" }),
          /* @__PURE__ */ jsx28("p", { className: "text-gray-700", children: "This Privacy Policy is governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates. Any disputes arising from this policy will be resolved in the appropriate courts of that jurisdiction." })
        ] })
      ] })
    ] }) })
  ] }) });
}

// app/routes/profile.tsx
var profile_exports = {};
__export(profile_exports, {
  default: () => Profile,
  loader: () => loader21,
  meta: () => meta6
});
import { useLoaderData as useLoaderData14, Link as Link15, Outlet as Outlet2, useLocation as useLocation2 } from "@remix-run/react";
import { json as json35 } from "@remix-run/node";

// app/components/ProfilePictureUpload.tsx
import { useState as useState16, useRef as useRef4 } from "react";
import { FiCamera } from "react-icons/fi";
import { jsx as jsx29, jsxs as jsxs26 } from "react/jsx-runtime";
var DEFAULT_PROFILE_PICTURE4 = "https://api.dicebear.com/7.x/initials/svg?seed=";
function ProfilePictureUpload({ currentPicture, username }) {
  let [preview, setPreview] = useState16(currentPicture), [isUploading, setIsUploading] = useState16(!1), fileInputRef = useRef4(null), getProfilePicture5 = (profilePicture, username2) => profilePicture || `${DEFAULT_PROFILE_PICTURE4}${encodeURIComponent(username2)}`, handleFileChange = async (e) => {
    let file = e.target.files?.[0];
    if (!file)
      return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setIsUploading(!0);
    let reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    }, reader.readAsDataURL(file);
    let formData = new FormData();
    formData.append("profilePicture", file);
    try {
      let response = await fetch("/api/profile/picture", {
        method: "POST",
        body: formData
      }), result = await response.json();
      response.ok && result.success ? (setPreview(result.profilePicture || null), window.location.reload()) : (alert(result.error || "Failed to upload profile picture"), setPreview(currentPicture));
    } catch {
      alert("Failed to upload profile picture"), setPreview(currentPicture);
    } finally {
      setIsUploading(!1);
    }
  };
  return /* @__PURE__ */ jsxs26("div", { className: "relative group", children: [
    /* @__PURE__ */ jsxs26("div", { className: "relative w-32 h-32 rounded-full overflow-hidden", children: [
      /* @__PURE__ */ jsx29(
        "img",
        {
          src: preview || getProfilePicture5(currentPicture, username),
          alt: `${username}'s profile`,
          className: "w-full h-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx29("div", { className: "absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: /* @__PURE__ */ jsx29(
        "button",
        {
          onClick: () => fileInputRef.current?.click(),
          className: "p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all",
          disabled: isUploading,
          children: /* @__PURE__ */ jsx29(FiCamera, { className: "w-6 h-6 text-white" })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx29(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        onChange: handleFileChange,
        className: "hidden",
        disabled: isUploading
      }
    ),
    isUploading && /* @__PURE__ */ jsx29("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full", children: /* @__PURE__ */ jsx29("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-white" }) })
  ] });
}

// app/routes/profile.tsx
import {
  FaGithub as FaGithub2,
  FaTwitter as FaTwitter2,
  FaLinkedin as FaLinkedin2,
  FaInstagram as FaInstagram2,
  FaFacebook as FaFacebook2,
  FaYoutube as FaYoutube2,
  FaTiktok as FaTiktok2,
  FaDiscord as FaDiscord2,
  FaReddit as FaReddit2,
  FaMedium as FaMedium2,
  FaStackOverflow as FaStackOverflow2,
  FaDev as FaDev2
} from "react-icons/fa";
import { FiThumbsUp as FiThumbsUp4, FiEdit2 as FiEdit24 } from "react-icons/fi";
init_schema();
import { eq as eq25, desc as desc11 } from "drizzle-orm";
import { jsx as jsx30, jsxs as jsxs27 } from "react/jsx-runtime";
var meta6 = ({ data }) => {
  let username = data?.user?.username || "Profile";
  return [
    { title: `${username} - portal.ask` },
    { name: "description", content: `View ${username}'s profile on portal.ask` }
  ];
}, DEFAULT_PROFILE_PICTURE5 = "https://api.dicebear.com/7.x/initials/svg?seed=";
function truncateContent2(content) {
  return content ? content.length > 100 ? content.substring(0, 100) + "..." : content : "";
}
function getProfilePicture4(profilePicture, username) {
  return profilePicture || `${DEFAULT_PROFILE_PICTURE5}${encodeURIComponent(username)}`;
}
var loader21 = async ({ request, context }) => {
  let userId = await requireUserId(request), db = createDb(context.env.DB), userRows = await db.select().from(users).where(eq25(users.id, userId)).limit(1);
  if (!userRows.length)
    throw new Response("User not found", { status: 404 });
  let user = userRows[0], profile = (await db.select().from(profiles).where(eq25(profiles.userId, userId)).limit(1))[0] || null, userPosts = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    createdAt: posts.createdAt
  }).from(posts).where(eq25(posts.authorId, userId)).orderBy(desc11(posts.createdAt)), repHistory = await db.select({
    id: reputationHistory.id,
    points: reputationHistory.points,
    action: reputationHistory.action,
    createdAt: reputationHistory.createdAt
  }).from(reputationHistory).where(eq25(reputationHistory.userId, userId)).orderBy(desc11(reputationHistory.createdAt)).limit(10), bookmarks2 = [];
  try {
    bookmarks2 = (await getUserBookmarks(db, userId)).map((bm) => ({
      id: bm.id,
      createdAt: bm.createdAt,
      post: {
        id: bm.post.id,
        title: bm.post.title,
        content: bm.post.content,
        media: [],
        // default empty array
        author: {
          id: bm.user.id,
          username: bm.user.username,
          profilePicture: bm.profile?.profilePicture || null
        },
        createdAt: bm.post.createdAt.toISOString(),
        visibilityVotes: 0,
        comments: 0,
        hasBounty: !1,
        bounty: null,
        tags: []
      }
    }));
  } catch (error) {
    console.error("Error fetching bookmarks:", error), bookmarks2 = [];
  }
  let userData = {
    id: user.id,
    email: user.email,
    username: user.username,
    reputationPoints: user.reputationPoints,
    integrityScore: user.integrityScore,
    totalRatings: user.totalRatings,
    createdAt: user.createdAt,
    profile: profile && {
      firstName: profile.firstName,
      lastName: profile.lastName,
      profilePicture: profile.profilePicture,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      github: profile.github,
      twitter: profile.twitter,
      linkedin: profile.linkedin,
      instagram: profile.instagram,
      facebook: profile.facebook,
      youtube: profile.youtube,
      tiktok: profile.tiktok,
      discord: profile.discord,
      reddit: profile.reddit,
      medium: profile.medium,
      stackoverflow: profile.stackoverflow,
      devto: profile.devto
    },
    posts: userPosts,
    reputationHistory: repHistory
  };
  return json35({ user: userData, isAuthenticated: !0, bookmarks: bookmarks2 });
}, SocialMediaIcons2 = ({ profile }) => {
  let socialLinks = [
    { icon: FaGithub2, url: profile.github, label: "GitHub", color: "hover:text-[#333]" },
    { icon: FaTwitter2, url: profile.twitter, label: "Twitter", color: "hover:text-[#1DA1F2]" },
    { icon: FaLinkedin2, url: profile.linkedin, label: "LinkedIn", color: "hover:text-[#0077B5]" },
    { icon: FaInstagram2, url: profile.instagram, label: "Instagram", color: "hover:text-[#E4405F]" },
    { icon: FaFacebook2, url: profile.facebook, label: "Facebook", color: "hover:text-[#1877F2]" },
    { icon: FaYoutube2, url: profile.youtube, label: "YouTube", color: "hover:text-[#FF0000]" },
    { icon: FaTiktok2, url: profile.tiktok, label: "TikTok", color: "hover:text-[#000000]" },
    { icon: FaDiscord2, url: profile.discord, label: "Discord", color: "hover:text-[#5865F2]" },
    { icon: FaReddit2, url: profile.reddit, label: "Reddit", color: "hover:text-[#FF4500]" },
    { icon: FaMedium2, url: profile.medium, label: "Medium", color: "hover:text-[#000000]" },
    { icon: FaStackOverflow2, url: profile.stackoverflow, label: "Stack Overflow", color: "hover:text-[#F48024]" },
    { icon: FaDev2, url: profile.devto, label: "Dev.to", color: "hover:text-[#0A0A0A]" }
  ].filter((link) => link.url);
  return socialLinks.length === 0 ? null : /* @__PURE__ */ jsx30("div", { className: "flex flex-wrap gap-4", children: socialLinks.map(({ icon: Icon, url, label, color }) => /* @__PURE__ */ jsx30(
    "a",
    {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: `text-gray-400 ${color} transition-colors p-2 rounded-lg hover:bg-white/10`,
      title: label,
      children: /* @__PURE__ */ jsx30(Icon, { className: "w-6 h-6" })
    },
    label
  )) });
};
function getActivityDescription3(action26) {
  return {
    POST_CREATED: "Created a new post",
    POST_UPVOTED: "Received an upvote on your post",
    POST_DOWNVOTED: "Received a downvote on your post",
    COMMENT_CREATED: "Added a comment",
    COMMENT_UPVOTED: "Received an upvote on your comment",
    COMMENT_DOWNVOTED: "Received a downvote on your comment",
    ANSWER_CREATED: "Provided an answer",
    ANSWER_UPVOTED: "Received an upvote on your answer",
    ANSWER_DOWNVOTED: "Received a downvote on your answer",
    ANSWER_ACCEPTED: "Your answer was accepted as the best solution",
    PROFILE_COMPLETED: "Completed your profile information",
    DAILY_LOGIN: "Logged in for the day",
    WEEKLY_STREAK: "Maintained a weekly activity streak",
    MONTHLY_CONTRIBUTOR: "Active contributor this month",
    HELPFUL_MEMBER: "Recognized as a helpful community member",
    FIRST_POST: "Created your first post",
    FIRST_ANSWER: "Provided your first answer",
    FIRST_COMMENT: "Added your first comment",
    REPUTATION_MILESTONE: "Reached a reputation milestone",
    COMMUNITY_ENGAGEMENT: "Active participation in the community",
    CREATE_POST: "Created a new post"
  }[action26] || action26;
}
function Profile() {
  let { user, isAuthenticated, bookmarks: bookmarks2 } = useLoaderData14(), isActivityPage = useLocation2().pathname === "/profile/activity";
  if (!isAuthenticated)
    return /* @__PURE__ */ jsx30(AuthNotice, {});
  if (!user)
    return /* @__PURE__ */ jsx30(Layout, { children: /* @__PURE__ */ jsxs27("div", { className: "flex flex-col justify-center items-center w-full h-full", children: [
      /* @__PURE__ */ jsx30("h1", { className: "text-white text-2xl", children: "User not found" }),
      /* @__PURE__ */ jsx30(Link15, { to: "/community", className: "mt-4 text-indigo-400 hover:text-indigo-300", children: "Go to Community" })
    ] }) });
  let reputationLevel = getReputationLevel(user.reputationPoints || 0), recentActivities = user.reputationHistory.slice(0, 5);
  return /* @__PURE__ */ jsx30(Layout, { children: /* @__PURE__ */ jsxs27("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 pb-16", children: [
    /* @__PURE__ */ jsxs27("div", { className: "mb-6 flex justify-between items-center mt-16", children: [
      /* @__PURE__ */ jsx30("h1", { className: "text-2xl font-bold text-white", children: "Profile" }),
      /* @__PURE__ */ jsxs27(
        Link15,
        {
          to: "/posts/create",
          className: "px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]",
          children: [
            /* @__PURE__ */ jsx30("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx30("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }) }),
            "Create Post"
          ]
        }
      )
    ] }),
    isActivityPage ? /* @__PURE__ */ jsx30(Outlet2, {}) : /* @__PURE__ */ jsxs27("div", { className: "bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]", children: [
      /* @__PURE__ */ jsxs27("div", { className: "flex items-start space-x-6", children: [
        /* @__PURE__ */ jsx30(
          ProfilePictureUpload,
          {
            currentPicture: user.profile?.profilePicture || null,
            username: user.username
          }
        ),
        /* @__PURE__ */ jsxs27("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx30("h2", { className: "text-xl font-semibold text-white", children: user.username }),
          /* @__PURE__ */ jsxs27("p", { className: "text-gray-400 mt-1", children: [
            "Member since ",
            new Date(user.createdAt).toLocaleDateString()
          ] }),
          /* @__PURE__ */ jsx30("div", { className: "mt-4", children: /* @__PURE__ */ jsxs27("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx30("div", { className: "bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50", children: /* @__PURE__ */ jsx30("span", { className: "text-violet-300 font-medium", children: reputationLevel }) }),
            /* @__PURE__ */ jsx30("div", { className: "bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50", children: /* @__PURE__ */ jsxs27("span", { className: "text-violet-300 font-medium", children: [
              user.reputationPoints || 0,
              " points"
            ] }) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs27("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsx30("h2", { className: "text-lg font-semibold text-violet-300 mb-4", children: "Profile Information" }),
        /* @__PURE__ */ jsxs27("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs27("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
            /* @__PURE__ */ jsx30("label", { className: "block text-sm font-medium text-violet-300", children: "Bio" }),
            /* @__PURE__ */ jsx30("p", { className: "mt-1 text-sm text-gray-300", children: user.profile?.bio || "No bio provided" })
          ] }),
          /* @__PURE__ */ jsxs27("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
            /* @__PURE__ */ jsx30("label", { className: "block text-sm font-medium text-violet-300", children: "Location" }),
            /* @__PURE__ */ jsx30("p", { className: "mt-1 text-sm text-gray-300", children: user.profile?.location || "No location provided" })
          ] }),
          /* @__PURE__ */ jsxs27("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
            /* @__PURE__ */ jsx30("label", { className: "block text-sm font-medium text-violet-300", children: "Website" }),
            /* @__PURE__ */ jsx30("p", { className: "mt-1 text-sm text-gray-300", children: user.profile?.website ? /* @__PURE__ */ jsx30(
              "a",
              {
                href: user.profile.website,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-violet-400 hover:text-violet-300",
                children: user.profile.website
              }
            ) : "No website provided" })
          ] }),
          /* @__PURE__ */ jsxs27("div", { className: "bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30", children: [
            /* @__PURE__ */ jsx30("label", { className: "block text-sm font-medium text-violet-300", children: "Social Media" }),
            /* @__PURE__ */ jsx30("div", { className: "mt-2", children: user.profile ? /* @__PURE__ */ jsx30(SocialMediaIcons2, { profile: user.profile }) : /* @__PURE__ */ jsx30("p", { className: "text-sm text-gray-300", children: "No social media links provided" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx30("div", { className: "mt-8", children: /* @__PURE__ */ jsx30(
        IntegrityDisplay,
        {
          user: {
            id: user.id,
            username: user.username,
            integrityScore: user.integrityScore || 5,
            totalRatings: user.totalRatings || 0
          },
          currentUserId: user.id,
          canRate: !1
        }
      ) }),
      /* @__PURE__ */ jsxs27("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs27("div", { children: [
          /* @__PURE__ */ jsx30("h2", { className: "text-lg font-semibold text-violet-300 mb-4", children: "Recent Activity" }),
          /* @__PURE__ */ jsxs27("div", { className: "space-y-2", children: [
            recentActivities.map((history) => /* @__PURE__ */ jsxs27("div", { className: "flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30", children: [
              /* @__PURE__ */ jsxs27("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx30("div", { className: "p-1.5 bg-violet-500/20 rounded-lg", children: /* @__PURE__ */ jsx30(FiThumbsUp4, { className: "w-3.5 h-3.5 text-violet-300" }) }),
                /* @__PURE__ */ jsxs27("div", { children: [
                  /* @__PURE__ */ jsx30("p", { className: "text-sm font-medium text-violet-300", children: getActivityDescription3(history.action) }),
                  /* @__PURE__ */ jsx30("p", { className: "text-xs text-gray-400 mt-0.5", children: new Date(history.createdAt).toLocaleDateString() })
                ] })
              ] }),
              /* @__PURE__ */ jsxs27("span", { className: `text-sm font-medium ${history.points > 0 ? "text-green-400" : "text-red-400"}`, children: [
                history.points > 0 ? "+" : "",
                history.points
              ] })
            ] }, history.id)),
            user.reputationHistory.length > 5 && /* @__PURE__ */ jsx30("div", { className: "mt-3 text-center", children: /* @__PURE__ */ jsx30(Link15, { to: "/profile/activity", className: "inline-block px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-md", children: "View All Activity" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs27("div", { children: [
          /* @__PURE__ */ jsx30("h2", { className: "text-lg font-semibold text-violet-300 mb-4", children: "Recent Posts" }),
          /* @__PURE__ */ jsx30("div", { className: "space-y-2", children: user.posts.map((post) => /* @__PURE__ */ jsx30("div", { className: "p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30", children: /* @__PURE__ */ jsxs27(Link15, { to: `/posts/${post.id}`, className: "block hover:bg-neutral-600/50 rounded-lg p-1.5 -m-1.5 transition-colors", children: [
            /* @__PURE__ */ jsxs27("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx30("div", { className: "p-1.5 bg-violet-500/20 rounded-lg", children: /* @__PURE__ */ jsx30(FiEdit24, { className: "w-3.5 h-3.5 text-violet-300" }) }),
              /* @__PURE__ */ jsx30("h3", { className: "text-sm font-medium text-violet-300", children: post.title })
            ] }),
            /* @__PURE__ */ jsx30("p", { className: "text-xs text-gray-300 line-clamp-2", children: truncateContent2(post.content) }),
            /* @__PURE__ */ jsxs27("div", { className: "mt-1 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx30("p", { className: "text-xs text-gray-400", children: new Date(post.createdAt).toLocaleDateString() }),
              /* @__PURE__ */ jsx30("span", { className: "text-xs text-violet-400 hover:text-violet-300 transition-colors", children: "Read more \u2192" })
            ] })
          ] }) }, post.id)) })
        ] })
      ] }),
      bookmarks2 && bookmarks2.length > 0 && /* @__PURE__ */ jsxs27("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsx30("h2", { className: "text-xl font-bold text-yellow-400 mb-4", children: "Bookmarked Posts" }),
        /* @__PURE__ */ jsx30("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: bookmarks2.map((bm) => /* @__PURE__ */ jsx30("div", { className: "bg-neutral-800/80 rounded-lg p-4 border border-yellow-400/40 transition-all duration-300 hover:bg-neutral-700/80 hover:border-yellow-300/60 hover:shadow-lg hover:shadow-yellow-400/20 hover:scale-[1.02] group", children: /* @__PURE__ */ jsxs27(Link15, { to: `/posts/${bm.post.id}`, className: "block", children: [
          /* @__PURE__ */ jsx30("h3", { className: "text-lg font-semibold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300", children: bm.post.title }),
          /* @__PURE__ */ jsx30("p", { className: "text-gray-300 mb-2 truncate group-hover:text-gray-200 transition-colors duration-300", children: bm.post.content.length > 100 ? bm.post.content.substring(0, 100) + "..." : bm.post.content }),
          /* @__PURE__ */ jsxs27("div", { className: "flex items-center space-x-2 mt-2", children: [
            /* @__PURE__ */ jsx30("img", { src: getProfilePicture4(bm.post.author.profilePicture, bm.post.author.username), alt: bm.post.author.username, className: "w-6 h-6 rounded-full" }),
            /* @__PURE__ */ jsx30("span", { className: "text-violet-400 group-hover:text-violet-300 transition-colors duration-300", children: bm.post.author.username })
          ] })
        ] }) }, bm.id)) })
      ] })
    ] })
  ] }) });
}

// app/routes/logout.tsx
var logout_exports = {};
__export(logout_exports, {
  action: () => action23,
  default: () => Logout
});
var action23 = async ({ request }) => await logout(request);
function Logout() {
  return null;
}

// app/routes/signup.tsx
var signup_exports = {};
__export(signup_exports, {
  action: () => action24,
  default: () => SignUp,
  loader: () => loader22,
  meta: () => meta7
});
import { json as json36, redirect as redirect6 } from "@remix-run/node";
import { Form as Form9, useActionData as useActionData6, useSearchParams as useSearchParams4, Link as Link16 } from "@remix-run/react";
import { useEffect as useEffect12, useRef as useRef5 } from "react";
import { jsx as jsx31, jsxs as jsxs28 } from "react/jsx-runtime";
var meta7 = () => [
  { title: "Sign Up - BountyHub" },
  { name: "description", content: "Create your BountyHub account" }
];
async function loader22({ request, context }) {
  let db = createDb(context.env.DB);
  return await getUser(request, db) ? redirect6("/profile") : json36({});
}
async function action24({ request, context }) {
  let form = await request.formData(), email = form.get("email"), password = form.get("password"), username = form.get("username"), redirectTo = form.get("redirectTo") || "/profile";
  if (!email || !password || !username)
    return json36({ error: "Email, password, and username are required" }, { status: 400 });
  let db = createDb(context.env.DB), result = await register(db, { email, password, username, redirectTo });
  return result instanceof Response ? result : json36(result, { status: 400 });
}
function SignUp() {
  let actionData = useActionData6(), [searchParams] = useSearchParams4(), emailRef = useRef5(null), passwordRef = useRef5(null), usernameRef = useRef5(null);
  return useEffect12(() => {
    actionData?.error && (actionData.error.includes("password") ? passwordRef.current?.focus() : actionData.error.includes("email") ? emailRef.current?.focus() : usernameRef.current?.focus());
  }, [actionData]), /* @__PURE__ */ jsx31(Layout, { children: /* @__PURE__ */ jsx31("div", { className: "min-h-screen flex items-center justify-center bg-neutral-900/95 py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs28("div", { className: "max-w-md w-full space-y-8", children: [
    /* @__PURE__ */ jsxs28("div", { children: [
      /* @__PURE__ */ jsx31("h2", { className: "mt-6 text-center text-3xl font-extrabold text-white", children: "Create your account" }),
      /* @__PURE__ */ jsxs28("p", { className: "mt-2 text-center text-sm text-gray-400", children: [
        "Or",
        " ",
        /* @__PURE__ */ jsx31(
          Link16,
          {
            to: "/login",
            className: "font-medium text-violet-400 hover:text-violet-300",
            children: "sign in to your existing account"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs28(Form9, { method: "post", className: "mt-8 space-y-6", children: [
      /* @__PURE__ */ jsx31(
        "input",
        {
          type: "hidden",
          name: "redirectTo",
          value: searchParams.get("redirectTo") ?? void 0
        }
      ),
      /* @__PURE__ */ jsxs28("div", { className: "rounded-md shadow-sm -space-y-px", children: [
        /* @__PURE__ */ jsxs28("div", { children: [
          /* @__PURE__ */ jsx31("label", { htmlFor: "username", className: "sr-only", children: "Username" }),
          /* @__PURE__ */ jsx31(
            "input",
            {
              ref: usernameRef,
              id: "username",
              name: "username",
              type: "text",
              autoComplete: "username",
              required: !0,
              className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm",
              placeholder: "Username",
              defaultValue: actionData?.fields?.username ?? "",
              "aria-invalid": actionData?.error ? !0 : void 0,
              "aria-describedby": "username-error"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs28("div", { children: [
          /* @__PURE__ */ jsx31("label", { htmlFor: "email", className: "sr-only", children: "Email address" }),
          /* @__PURE__ */ jsx31(
            "input",
            {
              ref: emailRef,
              id: "email",
              name: "email",
              type: "email",
              autoComplete: "email",
              required: !0,
              className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm",
              placeholder: "Email address",
              defaultValue: actionData?.fields?.email ?? "",
              "aria-invalid": actionData?.error ? !0 : void 0,
              "aria-describedby": "email-error"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs28("div", { children: [
          /* @__PURE__ */ jsx31("label", { htmlFor: "password", className: "sr-only", children: "Password" }),
          /* @__PURE__ */ jsx31(
            "input",
            {
              ref: passwordRef,
              id: "password",
              name: "password",
              type: "password",
              autoComplete: "new-password",
              required: !0,
              className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm",
              placeholder: "Password",
              "aria-invalid": actionData?.error ? !0 : void 0,
              "aria-describedby": "password-error"
            }
          )
        ] })
      ] }),
      actionData?.error ? /* @__PURE__ */ jsx31("div", { className: "rounded-md bg-red-500/10 border border-red-500/20 p-4", children: /* @__PURE__ */ jsx31("div", { className: "text-sm text-red-400", children: actionData.error }) }) : null,
      /* @__PURE__ */ jsx31("div", { children: /* @__PURE__ */ jsx31(
        "button",
        {
          type: "submit",
          className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500",
          children: "Create account"
        }
      ) })
    ] })
  ] }) }) });
}

// app/routes/wallet.tsx
var wallet_exports = {};
__export(wallet_exports, {
  ErrorBoundary: () => ErrorBoundary4,
  default: () => WalletPage,
  loader: () => loader23,
  meta: () => meta8
});
init_virtual_wallet_server();
import { json as json37 } from "@remix-run/node";
import { useLoaderData as useLoaderData15, useActionData as useActionData7, useRouteError as useRouteError4, isRouteErrorResponse as isRouteErrorResponse3 } from "@remix-run/react";
import { useState as useState18 } from "react";

// app/components/DirectDeposit.tsx
import { useState as useState17, useEffect as useEffect13 } from "react";
import { jsx as jsx32, jsxs as jsxs29 } from "react/jsx-runtime";
var TOKEN_SYMBOL5 = "BBUX";
function DirectDeposit({ onError }) {
  let [amount, setAmount] = useState17(""), [walletHooks, setWalletHooks] = useState17(null);
  return useEffect13(() => {
    typeof window < "u" && Promise.all([
      import("@solana/wallet-adapter-react"),
      import("@solana/web3.js")
    ]).then(([
      { useWallet },
      { SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey: PublicKey3 }
    ]) => {
      setWalletHooks({ useWallet, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey: PublicKey3 });
    }).catch((error) => {
      console.error("Failed to load wallet hooks:", error);
    });
  }, []), /* @__PURE__ */ jsxs29("div", { className: "bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]", children: [
    /* @__PURE__ */ jsxs29("h3", { className: "text-xl font-bold text-white mb-4", children: [
      "Direct ",
      TOKEN_SYMBOL5,
      " Deposit"
    ] }),
    /* @__PURE__ */ jsxs29("p", { className: "text-gray-400 mb-4", children: [
      "Send SOL directly to your virtual wallet. The equivalent amount in ",
      TOKEN_SYMBOL5,
      " will be credited to your account."
    ] }),
    /* @__PURE__ */ jsxs29("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs29("div", { children: [
        /* @__PURE__ */ jsx32("label", { htmlFor: "amount", className: "block text-sm font-medium text-gray-300 mb-2", children: "Amount (SOL)" }),
        /* @__PURE__ */ jsx32(
          "input",
          {
            type: "number",
            id: "amount",
            value: amount,
            onChange: (e) => setAmount(e.target.value),
            placeholder: "0.1",
            step: "0.01",
            min: "0",
            className: "w-full px-3 py-2 bg-neutral-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs29(
        "button",
        {
          onClick: async () => {
            if (!walletHooks) {
              onError?.("Wallet not available");
              return;
            }
            onError?.("Wallet integration needs to be refactored");
          },
          disabled: !walletHooks,
          className: "w-full py-2 px-4 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          children: [
            "Deposit ",
            amount ? amount + " SOL" : ""
          ]
        }
      )
    ] })
  ] });
}

// app/routes/wallet.tsx
init_bounty_bucks_info();

// app/utils/token-supply.server.ts
init_bounty_bucks_info();
import { Connection as Connection2, PublicKey as PublicKey2 } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
var SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", TOKEN_MINT2 = new PublicKey2(bounty_bucks_info_default.mint), INITIAL_SUPPLY = 1e9, TOKEN_DECIMALS = 9, TokenSupplyService = class {
  /**
   * Get current token supply information
   */
  static async getSupplyInfo() {
    try {
      let mintPubkey = new PublicKey2(TOKEN_MINT2), mintInfo = await getMint(this.connection, mintPubkey), currentSupply = Number(mintInfo.supply) / Math.pow(10, TOKEN_DECIMALS), burnedAmount = INITIAL_SUPPLY - currentSupply, burnPercentage = burnedAmount / INITIAL_SUPPLY * 100;
      return {
        initialSupply: INITIAL_SUPPLY,
        currentSupply,
        burnedAmount,
        burnPercentage,
        mintAuthority: mintInfo.mintAuthority?.toString(),
        freezeAuthority: mintInfo.freezeAuthority?.toString(),
        decimals: mintInfo.decimals,
        isInitialized: mintInfo.isInitialized
      };
    } catch (error) {
      if (console.error("Error getting supply info:", error), error instanceof Error && (error.message.includes("timeout") || error.message.includes("connection") || error.message.includes("network") || error.message.includes("fetch")))
        return console.log("Network error detected, returning fallback supply data"), {
          initialSupply: INITIAL_SUPPLY,
          currentSupply: INITIAL_SUPPLY,
          burnedAmount: 0,
          burnPercentage: 0,
          mintAuthority: null,
          freezeAuthority: null,
          decimals: TOKEN_DECIMALS,
          isInitialized: !0
        };
      throw error;
    }
  }
  /**
   * Check if supply is running low (for future governance decisions)
   */
  static async isSupplyLow(thresholdPercentage = 10) {
    let supplyInfo = await this.getSupplyInfo();
    return supplyInfo.currentSupply / supplyInfo.initialSupply * 100 <= thresholdPercentage;
  }
  /**
   * Get supply statistics for dashboard
   */
  static async getSupplyStats() {
    let supplyInfo = await this.getSupplyInfo();
    return {
      ...supplyInfo,
      // Add additional metrics
      tokensPerUser: supplyInfo.currentSupply / 1e3,
      // Assuming 1000 users, adjust as needed
      dailyBurnRate: 0,
      // Would need to track daily burns
      weeklyBurnRate: 0,
      // Would need to track weekly burns
      estimatedDaysUntilLow: this.estimateDaysUntilLow(supplyInfo.burnPercentage)
    };
  }
  /**
   * Estimate days until supply runs low based on current burn rate
   */
  static estimateDaysUntilLow(currentBurnPercentage) {
    let remainingPercentage = 100 - currentBurnPercentage, lowSupplyThreshold = 10;
    if (remainingPercentage <= lowSupplyThreshold)
      return 0;
    let monthlyBurnRate = 1, monthsUntilLow = (remainingPercentage - lowSupplyThreshold) / monthlyBurnRate;
    return Math.floor(monthsUntilLow * 30);
  }
  /**
   * Log supply information for monitoring
   */
  static async logSupplyInfo() {
    try {
      let supplyInfo = await this.getSupplyInfo();
      console.log("=== TOKEN SUPPLY INFO ==="), console.log(`Initial Supply: ${supplyInfo.initialSupply.toLocaleString()} PORTAL`), console.log(`Current Supply: ${supplyInfo.currentSupply.toLocaleString()} PORTAL`), console.log(`Burned Amount: ${supplyInfo.burnedAmount.toLocaleString()} PORTAL`), console.log(`Burn Percentage: ${supplyInfo.burnPercentage.toFixed(2)}%`), console.log(`Mint Authority: ${supplyInfo.mintAuthority}`), console.log("=========================");
    } catch (error) {
      console.error("Error logging supply info:", error);
    }
  }
};
__publicField(TokenSupplyService, "connection", new Connection2(SOLANA_RPC_URL));

// app/routes/wallet.tsx
import { jsx as jsx33, jsxs as jsxs30 } from "react/jsx-runtime";
var TOKEN_SYMBOL6 = bounty_bucks_info_default.symbol;
var meta8 = () => [
  { title: "Wallet - BountyHub" },
  { name: "description", content: "Manage your virtual wallet and transactions" }
];
async function loader23({ request, context }) {
  let db = createDb(context.env.DB), user = await getUser(request, db);
  if (!user)
    throw new Response("Unauthorized", { status: 401 });
  let walletData = await getWalletDetails(db, user.id), supplyStats = await TokenSupplyService.getSupplyStats();
  return json37({ user, walletData, supplyStats });
}
function WalletPage() {
  let { walletData, user, supplyStats } = useLoaderData15(), { wallet, transactions } = walletData, [activeTab, setActiveTab] = useState18("overview"), [showDepositModal, setShowDepositModal] = useState18(!1), [showWithdrawModal, setShowWithdrawModal] = useState18(!1), [showDepositConfirmation, setShowDepositConfirmation] = useState18(!1), [pendingDeposit, setPendingDeposit] = useState18(null), [depositResult, setDepositResult] = useState18(null), [isDepositLoading, setIsDepositLoading] = useState18(!1), [isConfirmLoading, setIsConfirmLoading] = useState18(!1), [depositMode, setDepositMode] = useState18("direct"), actionData = useActionData7(), [isWithdrawLoading, setIsWithdrawLoading] = useState18(!1), [withdrawResult, setWithdrawResult] = useState18(null), [withdrawError, setWithdrawError] = useState18(null), formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }), getTransactionIcon = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "\u{1F4B0}";
      case "WITHDRAW":
        return "\u{1F4B8}";
      case "BOUNTY_CREATED":
        return "\u{1F3AF}";
      case "BOUNTY_CLAIMED":
        return "\u{1F3C6}";
      case "BOUNTY_REFUNDED":
        return "\u21A9\uFE0F";
      default:
        return "\u{1F4CA}";
    }
  }, getTransactionColor = (type) => {
    switch (type) {
      case "DEPOSIT":
      case "BOUNTY_CLAIMED":
      case "BOUNTY_REFUNDED":
        return "text-green-600";
      case "WITHDRAW":
      case "BOUNTY_CREATED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, handleDeposit = async (amount) => {
    try {
      let result = await (await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      })).json();
      result.success ? (setDepositResult(result), setShowDepositModal(!1), setShowDepositConfirmation(!0)) : alert(result.error || "Failed to create deposit request");
    } catch (error) {
      console.error("Deposit error:", error), alert("Failed to create deposit request");
    }
  }, handleConfirmDeposit = async (transactionId) => {
    try {
      let result = await (await fetch("/api/wallet/confirm-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId })
      })).json();
      result.success ? (setDepositResult(result), setShowDepositConfirmation(!1), setTimeout(() => window.location.reload(), 1e3)) : alert(result.error || "Failed to confirm deposit");
    } catch (error) {
      console.error("Confirm deposit error:", error), alert("Failed to confirm deposit");
    }
  }, handleWithdraw = async (amount) => {
    try {
      let result = await (await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      })).json();
      result.success ? (setWithdrawResult(result), setShowWithdrawModal(!1), setTimeout(() => window.location.reload(), 1500)) : setWithdrawError(result.error || "Withdrawal failed.");
    } catch (error) {
      console.error("Withdrawal error:", error), setWithdrawError("Withdrawal failed.");
    }
  }, walletBalance = wallet?.balance || 0, walletTotalEarned = wallet?.totalEarned || 0, walletTotalSpent = wallet?.totalSpent || 0;
  return /* @__PURE__ */ jsx33(Layout, { children: /* @__PURE__ */ jsxs30("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxs30("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx33("h1", { className: "text-3xl font-bold text-white mb-2", children: "My Wallet" }),
      /* @__PURE__ */ jsxs30("p", { className: "text-gray-300", children: [
        "Manage your virtual ",
        TOKEN_SYMBOL6,
        " balance and transactions"
      ] })
    ] }),
    /* @__PURE__ */ jsx33("div", { className: "bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8", children: /* @__PURE__ */ jsxs30("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs30("div", { children: [
        /* @__PURE__ */ jsx33("h2", { className: "text-2xl font-semibold mb-2", children: "Virtual Balance" }),
        /* @__PURE__ */ jsxs30("p", { className: "text-3xl font-bold", children: [
          wallet ? wallet.balance.toFixed(4) : "0.0000",
          " ",
          TOKEN_SYMBOL6
        ] }),
        /* @__PURE__ */ jsx33("p", { className: "text-blue-100 mt-2", children: "Available for bounties and withdrawals" })
      ] }),
      /* @__PURE__ */ jsxs30("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxs30("div", { className: "mb-2", children: [
          /* @__PURE__ */ jsx33("p", { className: "text-blue-100", children: "Total Earned" }),
          /* @__PURE__ */ jsxs30("p", { className: "text-xl font-semibold", children: [
            wallet ? wallet.totalEarned.toFixed(4) : "0.0000",
            " ",
            TOKEN_SYMBOL6
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("p", { className: "text-blue-100", children: "Total Spent" }),
          /* @__PURE__ */ jsxs30("p", { className: "text-xl font-semibold", children: [
            wallet ? wallet.totalSpent.toFixed(4) : "0.0000",
            " ",
            TOKEN_SYMBOL6
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs30("div", { className: "bg-neutral-800 border border-yellow-600 rounded-lg p-4 mb-8", children: [
      /* @__PURE__ */ jsx33("h3", { className: "text-lg font-semibold text-yellow-300 mb-2", children: "BBUX Token Supply" }),
      /* @__PURE__ */ jsxs30("div", { className: "flex flex-wrap gap-6 items-center", children: [
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("span", { className: "block text-sm text-gray-400", children: "Initial Supply" }),
          /* @__PURE__ */ jsxs30("span", { className: "font-mono text-lg text-yellow-200", children: [
            supplyStats.initialSupply.toLocaleString(),
            " ",
            TOKEN_SYMBOL6
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("span", { className: "block text-sm text-gray-400", children: "Current Supply" }),
          /* @__PURE__ */ jsxs30("span", { className: "font-mono text-lg text-yellow-200", children: [
            supplyStats.currentSupply.toLocaleString(),
            " ",
            TOKEN_SYMBOL6
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("span", { className: "block text-sm text-gray-400", children: "Burned" }),
          /* @__PURE__ */ jsxs30("span", { className: "font-mono text-lg text-yellow-200", children: [
            supplyStats.burnedAmount.toLocaleString(),
            " ",
            TOKEN_SYMBOL6
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("span", { className: "block text-sm text-gray-400", children: "Burn %" }),
          /* @__PURE__ */ jsxs30("span", { className: "font-mono text-lg text-yellow-200", children: [
            supplyStats.burnPercentage.toFixed(4),
            "%"
          ] })
        ] })
      ] }),
      supplyStats.burnPercentage >= 75 && /* @__PURE__ */ jsxs30("div", { className: "mt-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg", children: [
        /* @__PURE__ */ jsx33("strong", { children: "\u26A0\uFE0F WARNING:" }),
        " Token supply is running low! Please contact the platform admin."
      ] }),
      supplyStats.burnPercentage >= 50 && supplyStats.burnPercentage < 75 && /* @__PURE__ */ jsxs30("div", { className: "mt-4 p-3 bg-yellow-900 border border-yellow-700 text-yellow-200 rounded-lg", children: [
        /* @__PURE__ */ jsx33("strong", { children: "\u26A0\uFE0F NOTICE:" }),
        " Token supply is getting low. Monitor burn rates and consider governance action."
      ] }),
      supplyStats.burnPercentage < 50 && /* @__PURE__ */ jsx33("div", { className: "mt-4 p-3 bg-green-900 border border-green-700 text-green-200 rounded-lg", children: /* @__PURE__ */ jsx33("strong", { children: "\u2705 Supply is healthy." }) })
    ] }),
    user && (user.solanaAddress || user.tokenAccountAddress) && /* @__PURE__ */ jsxs30("div", { className: "bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx33("h3", { className: "text-xl font-semibold mb-4 text-white", children: "Your Solana Addresses" }),
      /* @__PURE__ */ jsxs30("div", { className: "space-y-3", children: [
        user.solanaAddress && /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: "Wallet Address" }),
          /* @__PURE__ */ jsx33("p", { className: "font-mono text-sm bg-neutral-700 p-2 rounded border border-neutral-600 break-all text-gray-200", children: user.solanaAddress }),
          /* @__PURE__ */ jsx33("p", { className: "text-xs text-gray-400 mt-1", children: "Your generated Solana wallet address" })
        ] }),
        user.tokenAccountAddress && /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsxs30("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: [
            TOKEN_SYMBOL6,
            " Token Account"
          ] }),
          /* @__PURE__ */ jsx33("p", { className: "font-mono text-sm bg-neutral-700 p-2 rounded border border-neutral-600 break-all text-gray-200", children: user.tokenAccountAddress }),
          /* @__PURE__ */ jsxs30("p", { className: "text-xs text-gray-400 mt-1", children: [
            "Where your ",
            TOKEN_SYMBOL6,
            " tokens are stored"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs30("div", { className: "flex space-x-4 mb-6", children: [
      /* @__PURE__ */ jsxs30(
        "button",
        {
          onClick: () => setShowDepositModal(!0),
          className: "bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors",
          children: [
            "\u{1F4B0} Buy ",
            TOKEN_SYMBOL6,
            " with SOL"
          ]
        }
      ),
      /* @__PURE__ */ jsxs30(
        "button",
        {
          onClick: () => setShowWithdrawModal(!0),
          className: "bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors",
          children: [
            "\u{1F4B8} Sell ",
            TOKEN_SYMBOL6,
            " for SOL"
          ]
        }
      )
    ] }),
    showDepositModal && /* @__PURE__ */ jsx33("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs30("div", { className: "bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs30("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxs30("h3", { className: "text-xl font-semibold text-white", children: [
          "Buy ",
          TOKEN_SYMBOL6,
          " with SOL"
        ] }),
        /* @__PURE__ */ jsx33(
          "button",
          {
            onClick: () => setShowDepositModal(!1),
            className: "text-gray-400 hover:text-gray-200 text-2xl font-bold",
            children: "\xD7"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs30("div", { className: "flex space-x-1 mb-6 bg-neutral-700 rounded-lg p-1", children: [
        /* @__PURE__ */ jsx33(
          "button",
          {
            onClick: () => setDepositMode("direct"),
            className: `flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${depositMode === "direct" ? "bg-blue-500 text-white" : "text-gray-300 hover:text-white"}`,
            children: "\u{1F680} Direct Deposit"
          }
        ),
        /* @__PURE__ */ jsx33(
          "button",
          {
            onClick: () => setDepositMode("manual"),
            className: `flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${depositMode === "manual" ? "bg-blue-500 text-white" : "text-gray-300 hover:text-white"}`,
            children: "\u{1F4DD} Manual Deposit"
          }
        )
      ] }),
      depositMode === "direct" && /* @__PURE__ */ jsx33(
        DirectDeposit,
        {
          onError: (error) => {
            error !== "cancelled" && alert(error), setShowDepositModal(!1);
          }
        }
      ),
      depositMode === "manual" && /* @__PURE__ */ jsxs30("form", { onSubmit: async (e) => {
        e.preventDefault();
        let formData = new FormData(e.currentTarget);
        await handleDeposit(parseFloat(formData.get("amount")));
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs30("div", { className: "bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4", children: [
          /* @__PURE__ */ jsx33("h4", { className: "font-semibold text-yellow-200 mb-2", children: "Manual Deposit" }),
          /* @__PURE__ */ jsx33("p", { className: "text-yellow-300 text-sm", children: "You'll need to manually send SOL from your wallet and then confirm the transaction" })
        ] }),
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Amount (SOL)" }),
          /* @__PURE__ */ jsx33(
            "input",
            {
              type: "number",
              name: "amount",
              step: "0.001",
              min: "0.001",
              max: "1000",
              required: !0,
              className: "w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              placeholder: "0.1"
            }
          ),
          /* @__PURE__ */ jsxs30("p", { className: "text-sm text-gray-400 mt-1", children: [
            "You will receive the same amount in ",
            TOKEN_SYMBOL6,
            " tokens (1:1 exchange rate)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { className: "flex space-x-3", children: [
          /* @__PURE__ */ jsx33(
            "button",
            {
              type: "button",
              onClick: () => setShowDepositModal(!1),
              className: "flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx33(
            "button",
            {
              type: "submit",
              disabled: isDepositLoading,
              className: "flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: isDepositLoading ? "Creating..." : "Create Deposit Request"
            }
          )
        ] })
      ] })
    ] }) }),
    showDepositConfirmation && /* @__PURE__ */ jsx33("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs30("div", { className: "bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4", children: [
      /* @__PURE__ */ jsxs30("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx33("h3", { className: "text-xl font-semibold text-white", children: "Confirm Deposit" }),
        /* @__PURE__ */ jsx33(
          "button",
          {
            onClick: () => {
              setShowDepositConfirmation(!1), setPendingDeposit(null);
            },
            className: "text-gray-400 hover:text-gray-200 text-2xl font-bold",
            children: "\xD7"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs30("div", { className: "bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4", children: [
        /* @__PURE__ */ jsx33("h4", { className: "font-semibold text-blue-200 mb-2", children: "Instructions:" }),
        /* @__PURE__ */ jsx33("ol", { className: "list-decimal list-inside space-y-1 text-blue-300", children: pendingDeposit.instructions?.map((instruction, index) => /* @__PURE__ */ jsx33("li", { children: instruction }, index)) })
      ] }),
      /* @__PURE__ */ jsxs30("div", { className: "bg-neutral-700 border border-neutral-600 rounded-lg p-4 mb-4", children: [
        /* @__PURE__ */ jsx33("h4", { className: "font-semibold text-gray-200 mb-2", children: "Platform Address:" }),
        /* @__PURE__ */ jsx33("p", { className: "font-mono text-sm bg-neutral-600 p-2 rounded border border-neutral-500 text-gray-200", children: pendingDeposit.platformAddress })
      ] }),
      /* @__PURE__ */ jsxs30("form", { onSubmit: async (e) => {
        e.preventDefault();
        let formData = new FormData(e.currentTarget);
        await handleConfirmDeposit(formData.get("transactionId"));
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Transaction Signature" }),
          /* @__PURE__ */ jsx33(
            "input",
            {
              type: "text",
              name: "transactionId",
              required: !0,
              className: "w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              placeholder: "Paste the transaction signature from your wallet"
            }
          ),
          /* @__PURE__ */ jsx33("p", { className: "text-sm text-gray-400 mt-1", children: "Copy the transaction signature from your wallet after sending SOL" })
        ] }),
        /* @__PURE__ */ jsxs30("div", { className: "flex space-x-3", children: [
          /* @__PURE__ */ jsx33(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowDepositConfirmation(!1), setPendingDeposit(null);
              },
              className: "flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx33(
            "button",
            {
              type: "submit",
              disabled: isConfirmLoading,
              className: "flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: isConfirmLoading ? "Confirming..." : "Confirm Deposit"
            }
          )
        ] })
      ] })
    ] }) }),
    depositResult && /* @__PURE__ */ jsx33("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsx33("div", { className: "bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4", children: /* @__PURE__ */ jsxs30("div", { className: "bg-green-900 border border-green-700 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx33("h4", { className: "font-semibold text-green-200 mb-2", children: "Deposit Successful!" }),
      /* @__PURE__ */ jsx33("p", { className: "text-green-300", children: depositResult.message }),
      /* @__PURE__ */ jsx33(
        "button",
        {
          onClick: () => setDepositResult(null),
          className: "mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors",
          children: "Close"
        }
      )
    ] }) }) }),
    showWithdrawModal && /* @__PURE__ */ jsx33("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs30("div", { className: "bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4", children: [
      /* @__PURE__ */ jsxs30("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxs30("h3", { className: "text-xl font-semibold text-white", children: [
          "Sell ",
          TOKEN_SYMBOL6,
          " for SOL"
        ] }),
        /* @__PURE__ */ jsx33(
          "button",
          {
            onClick: () => setShowWithdrawModal(!1),
            className: "text-gray-400 hover:text-gray-200 text-2xl font-bold",
            children: "\xD7"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs30("form", { onSubmit: async (e) => {
        e.preventDefault();
        let formData = new FormData(e.currentTarget);
        await handleWithdraw(parseFloat(formData.get("amount")));
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsxs30("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: [
            "Amount (",
            TOKEN_SYMBOL6,
            ")"
          ] }),
          /* @__PURE__ */ jsx33(
            "input",
            {
              type: "number",
              name: "amount",
              step: "0.001",
              min: "0.001",
              max: wallet ? wallet.balance : 0,
              required: !0,
              className: "w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              placeholder: "0.1",
              onChange: (e) => {
                let amount = parseFloat(e.target.value) || 0, fee = amount * 0.03, netAmount = amount - fee, feeDisplay = document.getElementById("fee-display"), netDisplay = document.getElementById("net-display");
                feeDisplay && (feeDisplay.textContent = fee.toFixed(4)), netDisplay && (netDisplay.textContent = netAmount.toFixed(4));
              }
            }
          ),
          /* @__PURE__ */ jsxs30("p", { className: "text-sm text-gray-400 mt-1", children: [
            "Available: ",
            wallet ? wallet.balance.toFixed(4) : "0.0000",
            " ",
            TOKEN_SYMBOL6
          ] }),
          /* @__PURE__ */ jsxs30("div", { className: "mt-2 p-3 bg-neutral-700 rounded-md", children: [
            /* @__PURE__ */ jsxs30("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx33("span", { className: "text-gray-300", children: "Platform Fee (3%):" }),
              /* @__PURE__ */ jsx33("span", { className: "text-yellow-400", id: "fee-display", children: "0.0000" })
            ] }),
            /* @__PURE__ */ jsxs30("div", { className: "flex justify-between text-sm mt-1", children: [
              /* @__PURE__ */ jsx33("span", { className: "text-gray-300", children: "You'll receive:" }),
              /* @__PURE__ */ jsx33("span", { className: "text-green-400 font-medium", id: "net-display", children: "0.0000" })
            ] }),
            /* @__PURE__ */ jsx33("p", { className: "text-xs text-gray-400 mt-2", children: "The platform fee helps maintain and improve our services" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { children: [
          /* @__PURE__ */ jsx33("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Destination Solana Address" }),
          /* @__PURE__ */ jsx33(
            "input",
            {
              type: "text",
              name: "destination",
              required: !0,
              className: "w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              placeholder: "Enter your Solana address"
            }
          )
        ] }),
        withdrawError && /* @__PURE__ */ jsx33("div", { className: "bg-red-900 border border-red-700 text-red-200 rounded-lg p-3 text-sm", children: withdrawError }),
        /* @__PURE__ */ jsxs30("div", { className: "flex space-x-3", children: [
          /* @__PURE__ */ jsx33(
            "button",
            {
              type: "button",
              onClick: () => setShowWithdrawModal(!1),
              className: "flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx33(
            "button",
            {
              type: "submit",
              disabled: isWithdrawLoading,
              className: "flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: isWithdrawLoading ? "Processing..." : "Withdraw"
            }
          )
        ] })
      ] })
    ] }) }),
    withdrawResult && /* @__PURE__ */ jsx33("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsx33("div", { className: "bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4", children: /* @__PURE__ */ jsxs30("div", { className: "bg-blue-900 border border-blue-700 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx33("h4", { className: "font-semibold text-blue-200 mb-2", children: "Withdrawal Successful!" }),
      /* @__PURE__ */ jsx33("p", { className: "text-blue-300 mb-2", children: "Your withdrawal has been processed." }),
      /* @__PURE__ */ jsxs30("div", { className: "mb-4 p-3 bg-blue-800 rounded-md", children: [
        /* @__PURE__ */ jsxs30("div", { className: "flex justify-between text-sm mb-1", children: [
          /* @__PURE__ */ jsx33("span", { className: "text-blue-200", children: "Total Amount:" }),
          /* @__PURE__ */ jsxs30("span", { className: "text-white", children: [
            withdrawResult.totalAmount?.toFixed(4) || "N/A",
            " ",
            TOKEN_SYMBOL6
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { className: "flex justify-between text-sm mb-1", children: [
          /* @__PURE__ */ jsx33("span", { className: "text-blue-200", children: "Platform Fee (3%):" }),
          /* @__PURE__ */ jsxs30("span", { className: "text-yellow-300", children: [
            withdrawResult.platformFee?.toFixed(4) || "N/A",
            " ",
            TOKEN_SYMBOL6
          ] })
        ] }),
        /* @__PURE__ */ jsxs30("div", { className: "flex justify-between text-sm font-medium", children: [
          /* @__PURE__ */ jsx33("span", { className: "text-blue-200", children: "You received:" }),
          /* @__PURE__ */ jsxs30("span", { className: "text-green-300", children: [
            withdrawResult.netAmount?.toFixed(4) || "N/A",
            " SOL"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs30("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsx33("span", { className: "block text-sm text-gray-300", children: "Burn Transaction:" }),
        /* @__PURE__ */ jsx33(
          "a",
          {
            href: `https://explorer.solana.com/tx/${withdrawResult.burnSignature}?cluster=devnet`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-400 underline break-all",
            children: withdrawResult.burnSignature
          }
        )
      ] }),
      /* @__PURE__ */ jsxs30("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsx33("span", { className: "block text-sm text-gray-300", children: "SOL Transaction:" }),
        /* @__PURE__ */ jsx33(
          "a",
          {
            href: `https://explorer.solana.com/tx/${withdrawResult.solSignature}?cluster=devnet`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-400 underline break-all",
            children: withdrawResult.solSignature
          }
        )
      ] }),
      withdrawResult.platformFeeSignature && /* @__PURE__ */ jsxs30("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsx33("span", { className: "block text-sm text-gray-300", children: "Platform Fee Transaction:" }),
        /* @__PURE__ */ jsx33(
          "a",
          {
            href: `https://explorer.solana.com/tx/${withdrawResult.platformFeeSignature}?cluster=devnet`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-400 underline break-all",
            children: withdrawResult.platformFeeSignature
          }
        )
      ] }),
      /* @__PURE__ */ jsx33(
        "button",
        {
          onClick: () => setWithdrawResult(null),
          className: "mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors",
          children: "Close"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxs30("div", { className: "bg-neutral-800 border border-neutral-700 rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs30("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx33("h3", { className: "text-xl font-semibold text-white", children: "Recent Transactions" }),
        /* @__PURE__ */ jsx33(
          "a",
          {
            href: "/transactions",
            className: "text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors",
            children: "See All Transactions \u2192"
          }
        )
      ] }),
      transactions.length === 0 ? /* @__PURE__ */ jsx33("p", { className: "text-gray-400 text-center py-8", children: "No transactions yet" }) : /* @__PURE__ */ jsxs30("div", { className: "space-y-3", children: [
        transactions.map((transaction) => /* @__PURE__ */ jsxs30(
          "div",
          {
            className: "flex items-center justify-between p-4 border border-neutral-700 rounded-lg hover:bg-neutral-700",
            children: [
              /* @__PURE__ */ jsxs30("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx33("span", { className: "text-2xl", children: getTransactionIcon(transaction.type) }),
                /* @__PURE__ */ jsxs30("div", { children: [
                  /* @__PURE__ */ jsx33("p", { className: "font-medium text-white", children: transaction.description }),
                  /* @__PURE__ */ jsx33("p", { className: "text-sm text-gray-400", children: formatDate(transaction.createdAt) }),
                  transaction.bounty && /* @__PURE__ */ jsxs30("p", { className: "text-sm text-blue-400", children: [
                    "Bounty: ",
                    transaction.bounty.post.title
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs30("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxs30("p", { className: `font-semibold ${getTransactionColor(transaction.type)}`, children: [
                  transaction.type === "WITHDRAW" || transaction.type === "BOUNTY_CREATED" ? "-" : "+",
                  transaction.amount.toFixed(4),
                  " ",
                  TOKEN_SYMBOL6
                ] }),
                /* @__PURE__ */ jsxs30("p", { className: "text-sm text-gray-400", children: [
                  "Balance: ",
                  transaction.balanceAfter.toFixed(4),
                  " ",
                  TOKEN_SYMBOL6
                ] })
              ] })
            ]
          },
          transaction.id
        )),
        transactions.length === 5 && /* @__PURE__ */ jsx33("div", { className: "text-center pt-4", children: /* @__PURE__ */ jsx33("p", { className: "text-gray-400 text-sm", children: "Showing 5 most recent transactions" }) })
      ] })
    ] })
  ] }) });
}
function ErrorBoundary4() {
  let error = useRouteError4();
  return /* @__PURE__ */ jsx33("div", { className: "h-screen w-full bg-neutral-900 flex flex-col items-center justify-center", children: /* @__PURE__ */ jsxs30("div", { className: "w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-lg shadow-lg border border-red-500/30", children: [
    /* @__PURE__ */ jsxs30("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx33("div", { className: "mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4", children: /* @__PURE__ */ jsx33("svg", { className: "h-6 w-6 text-red-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx33("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }),
      /* @__PURE__ */ jsx33("h1", { className: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-2", children: "Wallet Error" }),
      /* @__PURE__ */ jsx33("p", { className: "text-gray-400 mb-6", children: isRouteErrorResponse3(error) ? error.status === 404 ? "The wallet page you're looking for doesn't exist." : "Failed to load wallet data. Please try again." : "An unexpected error occurred while loading your wallet." })
    ] }),
    /* @__PURE__ */ jsxs30("div", { className: "flex flex-col space-y-3", children: [
      /* @__PURE__ */ jsx33(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-center",
          children: "Try Again"
        }
      ),
      /* @__PURE__ */ jsx33(
        "a",
        {
          href: "/",
          className: "w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-center",
          children: "Return Home"
        }
      )
    ] })
  ] }) });
}

// app/routes/_index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => Index,
  loader: () => loader24,
  meta: () => meta9
});
import { redirect as redirect7 } from "@remix-run/node";
var meta9 = () => [
  { title: "portal.ask" },
  { name: "description", content: "Welcome to portal.ask!" }
], loader24 = async ({ request, context }) => {
  if (console.log("Index loader called, method:", request.method), console.log("Index loader called, context exists:", !!context), console.log("Index loader called, context.env exists:", !!context?.env), !context || !context.env || !context.env.DB)
    throw new Error("D1 Database binding is missing from context.env.DB");
  context.env.SESSION_SECRET && (global.SESSION_SECRET = context.env.SESSION_SECRET);
  let db = createDb(context.env.DB), user = await getUser(request, db);
  return console.log("Index loader - user found:", !!user), user ? (console.log("Index loader - redirecting to /profile"), redirect7("/profile")) : (console.log("Index loader - redirecting to /login"), redirect7("/login"));
};
function Index() {
  return null;
}

// app/routes/login.tsx
var login_exports = {};
__export(login_exports, {
  action: () => action25,
  default: () => Login,
  loader: () => loader25,
  meta: () => meta10
});
import { json as json38, redirect as redirect8 } from "@remix-run/node";
import { Form as Form11, useActionData as useActionData8, useSearchParams as useSearchParams5, Link as Link17 } from "@remix-run/react";
import { useEffect as useEffect14, useRef as useRef6 } from "react";
import { jsx as jsx34, jsxs as jsxs31 } from "react/jsx-runtime";
var meta10 = () => [
  { title: "Login - BountyHub" },
  { name: "description", content: "Login to your BountyHub account" }
];
async function loader25({ request, context }) {
  let db = createDb(context.env.DB);
  return await getUser(request, db) ? redirect8("/profile") : json38({});
}
async function action25({ request, context }) {
  let form = await request.formData(), email = form.get("email"), password = form.get("password"), redirectTo = form.get("redirectTo") || "/profile";
  if (!email || !password)
    return json38({ error: "Email and password are required" }, { status: 400 });
  let db = createDb(context.env.DB), result = await login(db, { email, password, redirectTo });
  return result instanceof Response ? result : json38(result, { status: 400 });
}
function Login() {
  let actionData = useActionData8(), [searchParams] = useSearchParams5(), emailRef = useRef6(null), passwordRef = useRef6(null);
  return useEffect14(() => {
    actionData?.error && (actionData.error === "Invalid credentials" ? passwordRef.current?.focus() : emailRef.current?.focus());
  }, [actionData]), /* @__PURE__ */ jsx34(Layout, { children: /* @__PURE__ */ jsx34("div", { className: "min-h-screen flex items-center justify-center bg-neutral-900/95 py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs31("div", { className: "max-w-md w-full space-y-8", children: [
    /* @__PURE__ */ jsxs31("div", { children: [
      /* @__PURE__ */ jsx34("h2", { className: "mt-6 text-center text-3xl font-extrabold text-white", children: "Sign in to your account" }),
      /* @__PURE__ */ jsxs31("p", { className: "mt-2 text-center text-sm text-gray-400", children: [
        "Or",
        " ",
        /* @__PURE__ */ jsx34(
          Link17,
          {
            to: "/signup",
            className: "font-medium text-violet-400 hover:text-violet-300",
            children: "create a new account"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs31(Form11, { method: "post", className: "mt-8 space-y-6", children: [
      /* @__PURE__ */ jsx34(
        "input",
        {
          type: "hidden",
          name: "redirectTo",
          value: searchParams.get("redirectTo") ?? void 0
        }
      ),
      /* @__PURE__ */ jsxs31("div", { className: "rounded-md shadow-sm -space-y-px", children: [
        /* @__PURE__ */ jsxs31("div", { children: [
          /* @__PURE__ */ jsx34("label", { htmlFor: "email", className: "sr-only", children: "Email address" }),
          /* @__PURE__ */ jsx34(
            "input",
            {
              ref: emailRef,
              id: "email",
              name: "email",
              type: "email",
              autoComplete: "email",
              required: !0,
              className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm",
              placeholder: "Email address",
              defaultValue: actionData?.fields?.email ?? "",
              "aria-invalid": actionData?.error ? !0 : void 0,
              "aria-describedby": "email-error"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs31("div", { children: [
          /* @__PURE__ */ jsx34("label", { htmlFor: "password", className: "sr-only", children: "Password" }),
          /* @__PURE__ */ jsx34(
            "input",
            {
              ref: passwordRef,
              id: "password",
              name: "password",
              type: "password",
              autoComplete: "current-password",
              required: !0,
              className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm",
              placeholder: "Password",
              "aria-invalid": actionData?.error ? !0 : void 0,
              "aria-describedby": "password-error"
            }
          )
        ] })
      ] }),
      actionData?.error ? /* @__PURE__ */ jsx34("div", { className: "rounded-md bg-red-500/10 border border-red-500/20 p-4", children: /* @__PURE__ */ jsx34("div", { className: "text-sm text-red-400", children: actionData.error }) }) : null,
      /* @__PURE__ */ jsx34("div", { children: /* @__PURE__ */ jsx34(
        "button",
        {
          type: "submit",
          className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500",
          children: "Sign in"
        }
      ) }),
      /* @__PURE__ */ jsx34("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx34("div", { className: "text-sm", children: /* @__PURE__ */ jsx34(
        Link17,
        {
          to: "/forgot-password",
          className: "font-medium text-violet-400 hover:text-violet-300",
          children: "Forgot your password?"
        }
      ) }) })
    ] })
  ] }) }) });
}

// app/routes/terms.tsx
var terms_exports = {};
__export(terms_exports, {
  default: () => TermsOfService,
  loader: () => loader26
});
import { json as json39 } from "@remix-run/node";
import { jsx as jsx35, jsxs as jsxs32 } from "react/jsx-runtime";
var loader26 = async ({ request }) => json39({});
function TermsOfService() {
  return /* @__PURE__ */ jsx35(Layout, { showNav: !1, children: /* @__PURE__ */ jsxs32("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxs32("div", { className: "mb-6 flex justify-between items-center mt-16", children: [
      /* @__PURE__ */ jsx35("h1", { className: "text-3xl font-bold text-white", children: "Terms of Service" }),
      /* @__PURE__ */ jsxs32("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxs32(
          "a",
          {
            href: "/api/terms.pdf",
            className: "px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx35("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx35("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
              "Download PDF"
            ]
          }
        ),
        /* @__PURE__ */ jsxs32(
          "button",
          {
            onClick: () => window.print(),
            className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx35("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx35("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" }) }),
              "Print"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx35("div", { className: "bg-white text-gray-900 rounded-lg shadow-lg p-8 print:shadow-none", children: /* @__PURE__ */ jsxs32("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs32("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx35("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Terms of Service" }),
        /* @__PURE__ */ jsxs32("p", { className: "text-gray-600", children: [
          "Last updated: ",
          (/* @__PURE__ */ new Date()).toLocaleDateString()
        ] })
      ] }),
      /* @__PURE__ */ jsxs32("div", { className: "space-y-6 text-sm leading-relaxed", children: [
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "1. Acceptance of Terms" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: 'By accessing and using portal.ask ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.' }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: 'These Terms of Service ("Terms") govern your use of our decentralized platform for knowledge sharing, community building, and reputation-based interactions.' })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "2. Description of Service" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "portal.ask is a decentralized platform that provides:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Knowledge sharing and Q&A functionality" }),
            /* @__PURE__ */ jsx35("li", { children: "Community building and interaction tools" }),
            /* @__PURE__ */ jsx35("li", { children: "Reputation and integrity scoring systems" }),
            /* @__PURE__ */ jsx35("li", { children: "Virtual wallet and token management" }),
            /* @__PURE__ */ jsx35("li", { children: "Bounty and reward mechanisms" }),
            /* @__PURE__ */ jsx35("li", { children: "Blockchain-based transaction processing" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "3. User Accounts and Registration" }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "3.1 Account Creation" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "To access certain features of the Platform, you must create an account. You agree to:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Provide accurate, current, and complete information" }),
            /* @__PURE__ */ jsx35("li", { children: "Maintain and update your account information" }),
            /* @__PURE__ */ jsx35("li", { children: "Keep your account credentials secure" }),
            /* @__PURE__ */ jsx35("li", { children: "Accept responsibility for all activities under your account" }),
            /* @__PURE__ */ jsx35("li", { children: "Notify us immediately of any unauthorized use" })
          ] }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "3.2 Account Eligibility" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "You must be at least 13 years old to create an account. By creating an account, you represent and warrant that you meet this age requirement." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "4. User Conduct and Responsibilities" }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "4.1 Acceptable Use" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Violate any applicable laws or regulations" }),
            /* @__PURE__ */ jsx35("li", { children: "Infringe on intellectual property rights" }),
            /* @__PURE__ */ jsx35("li", { children: "Harass, abuse, or harm other users" }),
            /* @__PURE__ */ jsx35("li", { children: "Post false, misleading, or fraudulent content" }),
            /* @__PURE__ */ jsx35("li", { children: "Attempt to gain unauthorized access to the Platform" }),
            /* @__PURE__ */ jsx35("li", { children: "Interfere with the Platform's operation or security" }),
            /* @__PURE__ */ jsx35("li", { children: "Use automated systems to access the Platform" }),
            /* @__PURE__ */ jsx35("li", { children: "Engage in spam or unsolicited communications" })
          ] }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "4.2 Content Standards" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "All content you post must:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Be accurate and truthful" }),
            /* @__PURE__ */ jsx35("li", { children: "Respect intellectual property rights" }),
            /* @__PURE__ */ jsx35("li", { children: "Not contain harmful, offensive, or inappropriate material" }),
            /* @__PURE__ */ jsx35("li", { children: "Comply with community guidelines" }),
            /* @__PURE__ */ jsx35("li", { children: "Not violate any third-party rights" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "5. Virtual Currency and Transactions" }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "5.1 PORTAL Tokens" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "The Platform uses PORTAL tokens as virtual currency for:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Creating bounties and rewards" }),
            /* @__PURE__ */ jsx35("li", { children: "Community transactions" }),
            /* @__PURE__ */ jsx35("li", { children: "Platform governance" }),
            /* @__PURE__ */ jsx35("li", { children: "Reputation and integrity systems" })
          ] }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "5.2 Transaction Terms" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "By using the Platform's transaction features, you agree to:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Understand that transactions are irreversible" }),
            /* @__PURE__ */ jsx35("li", { children: "Accept responsibility for all transactions initiated from your account" }),
            /* @__PURE__ */ jsx35("li", { children: "Comply with applicable financial regulations" }),
            /* @__PURE__ */ jsx35("li", { children: "Not engage in fraudulent or manipulative trading" }),
            /* @__PURE__ */ jsx35("li", { children: "Pay any applicable fees or charges" })
          ] }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "5.3 No Financial Advice" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "The Platform does not provide financial, investment, or legal advice. All transactions are at your own risk." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "6. Intellectual Property Rights" }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "6.1 Platform Rights" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "The Platform and its original content, features, and functionality are owned by portal.ask and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws." }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "6.2 User Content" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "You retain ownership of content you post, but grant us a license to:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Display and distribute your content on the Platform" }),
            /* @__PURE__ */ jsx35("li", { children: "Use your content for Platform improvement" }),
            /* @__PURE__ */ jsx35("li", { children: "Store and backup your content" }),
            /* @__PURE__ */ jsx35("li", { children: "Share your content as required by law" })
          ] }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "6.3 License Terms" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "This license is worldwide, non-exclusive, royalty-free, and transferable. It terminates when you delete your content or account, except where your content has been shared with others." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "7. Privacy and Data Protection" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference." }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "8. Disclaimers and Limitations" }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "8.1 Service Availability" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "We strive to maintain Platform availability but do not guarantee uninterrupted access. The Platform may be temporarily unavailable due to maintenance, updates, or technical issues." }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "8.2 Content Accuracy" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "We do not guarantee the accuracy, completeness, or usefulness of any content on the Platform. Users are responsible for verifying information and making their own decisions." }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "8.3 Limitation of Liability" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "To the maximum extent permitted by law, portal.ask shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Loss of profits, data, or use" }),
            /* @__PURE__ */ jsx35("li", { children: "Business interruption" }),
            /* @__PURE__ */ jsx35("li", { children: "Personal injury or property damage" }),
            /* @__PURE__ */ jsx35("li", { children: "Emotional distress" }),
            /* @__PURE__ */ jsx35("li", { children: "Any other damages arising from your use of the Platform" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "9. Indemnification" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "You agree to defend, indemnify, and hold harmless portal.ask and its affiliates from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Your use of the Platform" }),
            /* @__PURE__ */ jsx35("li", { children: "Your violation of these Terms" }),
            /* @__PURE__ */ jsx35("li", { children: "Your violation of any third-party rights" }),
            /* @__PURE__ */ jsx35("li", { children: "Your content posted on the Platform" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "10. Termination" }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "10.1 Termination by You" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Your account will be deactivated" }),
            /* @__PURE__ */ jsx35("li", { children: "Your public content may remain visible" }),
            /* @__PURE__ */ jsx35("li", { children: "Blockchain transactions cannot be reversed" }),
            /* @__PURE__ */ jsx35("li", { children: "Some data may be retained for legal compliance" })
          ] }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "10.2 Termination by Us" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Platform." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "11. Governing Law and Disputes" }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "11.1 Governing Law" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which portal.ask operates, without regard to its conflict of law provisions." }),
          /* @__PURE__ */ jsx35("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "11.2 Dispute Resolution" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "Any disputes arising from these Terms or your use of the Platform shall be resolved through:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Good faith negotiations between parties" }),
            /* @__PURE__ */ jsx35("li", { children: "Mediation if negotiations fail" }),
            /* @__PURE__ */ jsx35("li", { children: "Binding arbitration as a last resort" }),
            /* @__PURE__ */ jsx35("li", { children: "Court proceedings only if arbitration is not available" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "12. Changes to Terms" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "We reserve the right to modify these Terms at any time. We will notify users of material changes by:" }),
          /* @__PURE__ */ jsxs32("ul", { className: "list-disc list-inside text-gray-700 mb-4 space-y-1", children: [
            /* @__PURE__ */ jsx35("li", { children: "Posting updated Terms on the Platform" }),
            /* @__PURE__ */ jsx35("li", { children: "Sending email notifications to registered users" }),
            /* @__PURE__ */ jsx35("li", { children: "Displaying prominent notices on our website" })
          ] }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "Your continued use of the Platform after changes become effective constitutes acceptance of the updated Terms." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "13. Severability" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "14. Entire Agreement" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "These Terms, together with our Privacy Policy, constitute the entire agreement between you and portal.ask regarding your use of the Platform and supersede all prior agreements and understandings." })
        ] }),
        /* @__PURE__ */ jsxs32("section", { children: [
          /* @__PURE__ */ jsx35("h2", { className: "text-xl font-semibold text-gray-900 mb-3", children: "15. Contact Information" }),
          /* @__PURE__ */ jsx35("p", { className: "text-gray-700 mb-3", children: "If you have any questions about these Terms of Service, please contact us:" }),
          /* @__PURE__ */ jsxs32("div", { className: "bg-gray-50 p-4 rounded-lg", children: [
            /* @__PURE__ */ jsxs32("p", { className: "text-gray-700 mb-2", children: [
              /* @__PURE__ */ jsx35("strong", { children: "Email:" }),
              " bountybucks524@gmail.com"
            ] }),
            /* @__PURE__ */ jsxs32("p", { className: "text-gray-700 mb-2", children: [
              /* @__PURE__ */ jsx35("strong", { children: "Platform:" }),
              " portal.ask"
            ] }),
            /* @__PURE__ */ jsx35("p", { className: "text-gray-700", children: "We will respond to your inquiry within a reasonable timeframe." })
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
}

// app/routes/docs.tsx
var docs_exports = {};
__export(docs_exports, {
  default: () => DocsPage,
  loader: () => loader27,
  meta: () => meta11
});
import { json as json40 } from "@remix-run/node";
import { useLoaderData as useLoaderData16, Link as Link18 } from "@remix-run/react";
import {
  FiBook,
  FiUser as FiUser2,
  FiCode,
  FiServer,
  FiCloud,
  FiShield as FiShield5,
  FiExternalLink as FiExternalLink3,
  FiMessageSquare as FiMessageSquare3,
  FiMail as FiMail2
} from "react-icons/fi";
import { jsx as jsx36, jsxs as jsxs33 } from "react/jsx-runtime";
var meta11 = () => [
  { title: "Documentation - portal.ask" },
  { name: "description", content: "Learn how to use portal.ask and explore our documentation" }
], loader27 = async () => json40({
  docs: [
    {
      title: "Platform Documentation",
      description: "Complete overview of portal.ask platform features, architecture, and functionality",
      href: "/docs/platform",
      category: "overview",
      featured: !0
    },
    {
      title: "User Guide",
      description: "Step-by-step guide for using all platform features and getting the most out of portal.ask",
      href: "/docs/user-guide",
      category: "user",
      featured: !0
    },
    {
      title: "Developer Guide",
      description: "Technical documentation for developers, contributors, and integrators",
      href: "/docs/developer-guide",
      category: "developer",
      featured: !0
    },
    {
      title: "API Reference",
      description: "Complete API documentation with endpoints, examples, and integration guides",
      href: "/docs/api-reference",
      category: "developer",
      featured: !1
    },
    {
      title: "Deployment Guide",
      description: "Production deployment instructions and infrastructure setup",
      href: "/docs/deployment-guide",
      category: "developer",
      featured: !1
    },
    {
      title: "Legal Documents",
      description: "Privacy policy and terms of service with PDF download options",
      href: "/docs/legal",
      category: "legal",
      featured: !1
    },
    {
      title: "Refund System Guide",
      description: "Complete guide to the community governance refund system and time-based restrictions",
      href: "/docs/refund-system",
      category: "user",
      featured: !1
    }
  ],
  categories: [
    {
      name: "overview",
      title: "Platform Overview",
      description: "General platform information and architecture"
    },
    {
      name: "user",
      title: "User Documentation",
      description: "Guides and tutorials for platform users"
    },
    {
      name: "developer",
      title: "Developer Resources",
      description: "Technical documentation and API references"
    },
    {
      name: "legal",
      title: "Legal & Compliance",
      description: "Legal documents and compliance information"
    }
  ]
});
function DocsPage() {
  let data = useLoaderData16(), { docs, categories } = data, docsWithIcons = [
    { ...docs[0], icon: FiBook },
    { ...docs[1], icon: FiUser2 },
    { ...docs[2], icon: FiCode },
    { ...docs[3], icon: FiServer },
    { ...docs[4], icon: FiCloud },
    { ...docs[5], icon: FiShield5 },
    { ...docs[6], icon: FiShield5 }
  ], getCategoryDocs = (categoryName) => docsWithIcons.filter((doc) => doc.category === categoryName);
  return /* @__PURE__ */ jsx36(Layout, { children: /* @__PURE__ */ jsxs33("div", { className: "w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16", children: [
    /* @__PURE__ */ jsxs33("div", { className: "mb-8 mt-16", children: [
      /* @__PURE__ */ jsx36("h1", { className: "text-4xl font-bold text-white mb-4", children: "Documentation" }),
      /* @__PURE__ */ jsx36("p", { className: "text-gray-400 text-lg max-w-3xl", children: "Welcome to the portal.ask documentation. Find everything you need to understand, use, and develop with our platform." })
    ] }),
    /* @__PURE__ */ jsxs33("div", { className: "mb-20", children: [
      /* @__PURE__ */ jsx36("h2", { className: "text-2xl font-semibold text-white mb-6", children: "Getting Started" }),
      /* @__PURE__ */ jsx36("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: (() => docsWithIcons.filter((doc) => doc.featured))().map((doc) => /* @__PURE__ */ jsxs33(
        Link18,
        {
          to: doc.href,
          className: "group block p-6 bg-neutral-800/80 rounded-lg border-2 border-violet-500/30 hover:border-violet-500/60 transition-all duration-300 shadow-lg hover:shadow-violet-500/20",
          children: [
            /* @__PURE__ */ jsxs33("div", { className: "flex items-center mb-4", children: [
              /* @__PURE__ */ jsx36(doc.icon, { className: "w-8 h-8 text-violet-400 mr-4" }),
              /* @__PURE__ */ jsx36("h3", { className: "text-xl font-semibold text-white group-hover:text-violet-300 transition-colors", children: doc.title })
            ] }),
            /* @__PURE__ */ jsx36("p", { className: "text-gray-400 group-hover:text-gray-300 transition-colors", children: doc.description }),
            /* @__PURE__ */ jsxs33("div", { className: "mt-4 flex items-center text-violet-400 group-hover:text-violet-300 transition-colors", children: [
              /* @__PURE__ */ jsx36("span", { className: "text-sm font-medium", children: "Read more" }),
              /* @__PURE__ */ jsx36(FiExternalLink3, { className: "w-4 h-4 ml-2" })
            ] })
          ]
        },
        doc.href
      )) })
    ] }),
    /* @__PURE__ */ jsx36("div", { className: "space-y-20", children: categories.map((category) => /* @__PURE__ */ jsxs33("div", { children: [
      /* @__PURE__ */ jsxs33("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx36("h2", { className: "text-2xl font-semibold text-white mb-3", children: category.title }),
        /* @__PURE__ */ jsx36("p", { className: "text-gray-400", children: category.description })
      ] }),
      /* @__PURE__ */ jsx36("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: getCategoryDocs(category.name).map((doc) => /* @__PURE__ */ jsxs33(
        Link18,
        {
          to: doc.href,
          className: "group block p-6 bg-neutral-800/60 rounded-lg border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300",
          children: [
            /* @__PURE__ */ jsxs33("div", { className: "flex items-center mb-3", children: [
              /* @__PURE__ */ jsx36(doc.icon, { className: "w-6 h-6 text-violet-400 mr-4" }),
              /* @__PURE__ */ jsx36("h3", { className: "text-lg font-medium text-white group-hover:text-violet-300 transition-colors", children: doc.title })
            ] }),
            /* @__PURE__ */ jsx36("p", { className: "text-gray-400 text-sm group-hover:text-gray-300 transition-colors", children: doc.description })
          ]
        },
        doc.href
      )) })
    ] }, category.name)) }),
    /* @__PURE__ */ jsxs33("div", { className: "mt-20 p-8 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-lg border border-violet-500/30", children: [
      /* @__PURE__ */ jsx36("h2", { className: "text-2xl font-semibold text-white mb-6", children: "Quick Links" }),
      /* @__PURE__ */ jsxs33("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [
        /* @__PURE__ */ jsxs33(
          Link18,
          {
            to: "/community",
            className: "flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors",
            children: [
              /* @__PURE__ */ jsx36(FiUser2, { className: "w-5 h-5 text-violet-400 mr-3" }),
              /* @__PURE__ */ jsx36("span", { className: "text-white", children: "Community" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs33(
          Link18,
          {
            to: "/posts/create",
            className: "flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors",
            children: [
              /* @__PURE__ */ jsx36(FiCode, { className: "w-5 h-5 text-violet-400 mr-3" }),
              /* @__PURE__ */ jsx36("span", { className: "text-white", children: "Create Post" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs33(
          Link18,
          {
            to: "/wallet",
            className: "flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors",
            children: [
              /* @__PURE__ */ jsx36(FiCloud, { className: "w-5 h-5 text-violet-400 mr-3" }),
              /* @__PURE__ */ jsx36("span", { className: "text-white", children: "Wallet" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs33(
          Link18,
          {
            to: "/settings",
            className: "flex items-center p-4 bg-neutral-800/60 rounded-lg hover:bg-neutral-700/60 transition-colors",
            children: [
              /* @__PURE__ */ jsx36(FiShield5, { className: "w-5 h-5 text-violet-400 mr-3" }),
              /* @__PURE__ */ jsx36("span", { className: "text-white", children: "Settings" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs33("div", { className: "mt-20 p-8 bg-neutral-800/60 rounded-lg border border-violet-500/20", children: [
      /* @__PURE__ */ jsx36("h2", { className: "text-2xl font-semibold text-white mb-6", children: "Need Help?" }),
      /* @__PURE__ */ jsxs33("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs33("div", { className: "flex items-center p-4 bg-neutral-700/40 rounded-lg", children: [
          /* @__PURE__ */ jsx36(FiMessageSquare3, { className: "w-6 h-6 text-violet-400 mr-3" }),
          /* @__PURE__ */ jsxs33("div", { children: [
            /* @__PURE__ */ jsx36("h3", { className: "text-white font-medium", children: "Discord Community" }),
            /* @__PURE__ */ jsx36("p", { className: "text-gray-400 text-sm", children: "Join our community for real-time help" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs33("div", { className: "flex items-center p-4 bg-neutral-700/40 rounded-lg", children: [
          /* @__PURE__ */ jsx36(FiMessageSquare3, { className: "w-6 h-6 text-violet-400 mr-3" }),
          /* @__PURE__ */ jsxs33("div", { children: [
            /* @__PURE__ */ jsx36("h3", { className: "text-white font-medium", children: "GitHub Issues" }),
            /* @__PURE__ */ jsx36("p", { className: "text-gray-400 text-sm", children: "Report bugs and request features" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs33("div", { className: "flex items-center p-4 bg-neutral-700/40 rounded-lg", children: [
          /* @__PURE__ */ jsx36(FiMail2, { className: "w-6 h-6 text-violet-400 mr-3" }),
          /* @__PURE__ */ jsxs33("div", { children: [
            /* @__PURE__ */ jsx36("h3", { className: "text-white font-medium", children: "Email Support" }),
            /* @__PURE__ */ jsx36("p", { className: "text-gray-400 text-sm", children: "Get direct support via email" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs33("div", { className: "mt-6 text-center", children: [
        /* @__PURE__ */ jsx36("p", { className: "text-gray-400 mb-4", children: "Can't find what you're looking for? Our team is here to help!" }),
        /* @__PURE__ */ jsxs33("div", { className: "flex justify-center space-x-4", children: [
          /* @__PURE__ */ jsxs33(
            "a",
            {
              href: "https://discord.gg/zvB9gwhq",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx36(FiMessageSquare3, { className: "w-4 h-4 mr-2" }),
                "Join Discord"
              ]
            }
          ),
          /* @__PURE__ */ jsxs33(
            "a",
            {
              href: "mailto:bountybucks524@gmail.com",
              className: "inline-flex items-center px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors",
              children: [
                /* @__PURE__ */ jsx36(FiMail2, { className: "w-4 h-4 mr-2" }),
                "Contact Support"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-GWH4SNRQ.js", imports: ["/build/_shared/chunk-NE4BQMTE.js", "/build/_shared/chunk-M52IJKKB.js", "/build/_shared/chunk-7ZSQYYGQ.js", "/build/_shared/chunk-G5WX4PPA.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-HTAYJXMP.js", imports: ["/build/_shared/chunk-6S2QUAFR.js", "/build/_shared/chunk-MQYEVBU3.js", "/build/_shared/chunk-5TRFQBKG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 }, "routes/$username": { id: "routes/$username", parentId: "root", path: ":username", index: void 0, caseSensitive: void 0, module: "/build/routes/$username-VN5M7RSP.js", imports: ["/build/_shared/chunk-PC65EDHQ.js", "/build/_shared/chunk-VI4IRXJP.js", "/build/_shared/chunk-DGIOIJIX.js", "/build/_shared/chunk-GE4ZJASY.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/$username.posts": { id: "routes/$username.posts", parentId: "routes/$username", path: "posts", index: void 0, caseSensitive: void 0, module: "/build/routes/$username.posts-CGN6HCUM.js", imports: ["/build/_shared/chunk-MQYEVBU3.js", "/build/_shared/chunk-5TRFQBKG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/_index": { id: "routes/_index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/_index-FSXDSYOK.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.answers.$answerId.vote": { id: "routes/api.answers.$answerId.vote", parentId: "root", path: "api/answers/:answerId/vote", index: void 0, caseSensitive: void 0, module: "/build/routes/api.answers.$answerId.vote-UW54CVND.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.bookmarks-status": { id: "routes/api.bookmarks-status", parentId: "root", path: "api/bookmarks-status", index: void 0, caseSensitive: void 0, module: "/build/routes/api.bookmarks-status-SUQV6H62.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.bookmarks-toggle": { id: "routes/api.bookmarks-toggle", parentId: "root", path: "api/bookmarks-toggle", index: void 0, caseSensitive: void 0, module: "/build/routes/api.bookmarks-toggle-Z6Y2EOUA.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.bounty.claim": { id: "routes/api.bounty.claim", parentId: "root", path: "api/bounty/claim", index: void 0, caseSensitive: void 0, module: "/build/routes/api.bounty.claim-4ZEDX5T5.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.comments.$commentId.vote": { id: "routes/api.comments.$commentId.vote", parentId: "root", path: "api/comments/:commentId/vote", index: void 0, caseSensitive: void 0, module: "/build/routes/api.comments.$commentId.vote-CZSD4KS5.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.integrity.rate": { id: "routes/api.integrity.rate", parentId: "root", path: "api/integrity/rate", index: void 0, caseSensitive: void 0, module: "/build/routes/api.integrity.rate-IMSSEOHP.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.integrity.report": { id: "routes/api.integrity.report", parentId: "root", path: "api/integrity/report", index: void 0, caseSensitive: void 0, module: "/build/routes/api.integrity.report-RSA6WKMA.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.posts.$postId": { id: "routes/api.posts.$postId", parentId: "root", path: "api/posts/:postId", index: void 0, caseSensitive: void 0, module: "/build/routes/api.posts.$postId-YGBZFLPW.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.posts.$postId.vote": { id: "routes/api.posts.$postId.vote", parentId: "routes/api.posts.$postId", path: "vote", index: void 0, caseSensitive: void 0, module: "/build/routes/api.posts.$postId.vote-NBKAYBLE.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.posts.delete": { id: "routes/api.posts.delete", parentId: "root", path: "api/posts/delete", index: void 0, caseSensitive: void 0, module: "/build/routes/api.posts.delete-FKKMFTNB.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.privacy.pdf": { id: "routes/api.privacy.pdf", parentId: "root", path: "api/privacy/pdf", index: void 0, caseSensitive: void 0, module: "/build/routes/api.privacy.pdf-KQJ6I5V7.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.profile.picture": { id: "routes/api.profile.picture", parentId: "root", path: "api/profile/picture", index: void 0, caseSensitive: void 0, module: "/build/routes/api.profile.picture-YAPKYI3V.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.refund.request": { id: "routes/api.refund.request", parentId: "root", path: "api/refund/request", index: void 0, caseSensitive: void 0, module: "/build/routes/api.refund.request-RUBNJAZZ.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.refund.requests": { id: "routes/api.refund.requests", parentId: "root", path: "api/refund/requests", index: void 0, caseSensitive: void 0, module: "/build/routes/api.refund.requests-O5BE6NVO.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.refund.vote": { id: "routes/api.refund.vote", parentId: "root", path: "api/refund/vote", index: void 0, caseSensitive: void 0, module: "/build/routes/api.refund.vote-BVIXA4VT.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.terms.pdf": { id: "routes/api.terms.pdf", parentId: "root", path: "api/terms/pdf", index: void 0, caseSensitive: void 0, module: "/build/routes/api.terms.pdf-HIAO46YQ.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.wallet.cancel-transaction": { id: "routes/api.wallet.cancel-transaction", parentId: "root", path: "api/wallet/cancel-transaction", index: void 0, caseSensitive: void 0, module: "/build/routes/api.wallet.cancel-transaction-QSFVUSIE.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.wallet.confirm-deposit": { id: "routes/api.wallet.confirm-deposit", parentId: "root", path: "api/wallet/confirm-deposit", index: void 0, caseSensitive: void 0, module: "/build/routes/api.wallet.confirm-deposit-MOIF5EVU.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.wallet.deposit": { id: "routes/api.wallet.deposit", parentId: "root", path: "api/wallet/deposit", index: void 0, caseSensitive: void 0, module: "/build/routes/api.wallet.deposit-5FTD6S54.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.wallet.withdraw": { id: "routes/api.wallet.withdraw", parentId: "root", path: "api/wallet/withdraw", index: void 0, caseSensitive: void 0, module: "/build/routes/api.wallet.withdraw-DZQ53G34.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/community": { id: "routes/community", parentId: "root", path: "community", index: void 0, caseSensitive: void 0, module: "/build/routes/community-666LOC7C.js", imports: ["/build/_shared/chunk-VI4IRXJP.js", "/build/_shared/chunk-QJHMVXXJ.js", "/build/_shared/chunk-DGIOIJIX.js", "/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/default-avatar.png": { id: "routes/default-avatar.png", parentId: "root", path: "default-avatar/png", index: void 0, caseSensitive: void 0, module: "/build/routes/default-avatar.png-AHJ7WDHH.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/docs": { id: "routes/docs", parentId: "root", path: "docs", index: void 0, caseSensitive: void 0, module: "/build/routes/docs-O7EXHWWY.js", imports: ["/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/docs.legal": { id: "routes/docs.legal", parentId: "routes/docs", path: "legal", index: void 0, caseSensitive: void 0, module: "/build/routes/docs.legal-YGONMULE.js", imports: ["/build/_shared/chunk-5TRFQBKG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/docs.platform": { id: "routes/docs.platform", parentId: "routes/docs", path: "platform", index: void 0, caseSensitive: void 0, module: "/build/routes/docs.platform-C3ALHO6X.js", imports: ["/build/_shared/chunk-5TRFQBKG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/docs.refund-system": { id: "routes/docs.refund-system", parentId: "routes/docs", path: "refund-system", index: void 0, caseSensitive: void 0, module: "/build/routes/docs.refund-system-CDPZHHG3.js", imports: ["/build/_shared/chunk-5TRFQBKG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/login": { id: "routes/login", parentId: "root", path: "login", index: void 0, caseSensitive: void 0, module: "/build/routes/login-HIVH4L2B.js", imports: ["/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/logout": { id: "routes/logout", parentId: "root", path: "logout", index: void 0, caseSensitive: void 0, module: "/build/routes/logout-5YZOOWKM.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/posts.$postId": { id: "routes/posts.$postId", parentId: "root", path: "posts/:postId", index: void 0, caseSensitive: void 0, module: "/build/routes/posts.$postId-TDJKXYQ7.js", imports: ["/build/_shared/chunk-54UN6YQK.js", "/build/_shared/chunk-SICW524A.js", "/build/_shared/chunk-FUZFIQN5.js", "/build/_shared/chunk-2YZ7TZSG.js", "/build/_shared/chunk-FGS6CPL7.js", "/build/_shared/chunk-GW7FZVM5.js", "/build/_shared/chunk-DGXI5RJE.js", "/build/_shared/chunk-RM73K6RH.js", "/build/_shared/chunk-TV6J5LVP.js", "/build/_shared/chunk-F7QMDYXS.js", "/build/_shared/chunk-A6ZVAP33.js", "/build/_shared/chunk-KOU7KXJE.js", "/build/_shared/chunk-ZVDYBXYH.js", "/build/_shared/chunk-NWTBI763.js", "/build/_shared/chunk-RV3KCD2Q.js", "/build/_shared/chunk-FQTK4I2O.js", "/build/_shared/chunk-NCPUIDGO.js", "/build/_shared/chunk-EUY7HEKH.js", "/build/_shared/chunk-JVOZNRBH.js", "/build/_shared/chunk-XHVR4ZVO.js", "/build/_shared/chunk-G74JO6TW.js", "/build/_shared/chunk-OJWRQYFE.js", "/build/_shared/chunk-P6R5TE4B.js", "/build/_shared/chunk-3QEU627O.js", "/build/_shared/chunk-EMUF5WYA.js", "/build/_shared/chunk-MUCI2AX4.js", "/build/_shared/chunk-3SZQ2EU6.js", "/build/_shared/chunk-EJUGCY4O.js", "/build/_shared/chunk-RPN7754G.js", "/build/_shared/chunk-GE3LEUT5.js", "/build/_shared/chunk-3MPNIHC6.js", "/build/_shared/chunk-QUKSBBKR.js", "/build/_shared/chunk-Y56G7LIZ.js", "/build/_shared/chunk-W2BATQOT.js", "/build/_shared/chunk-4T2T64QM.js", "/build/_shared/chunk-D2YWGCXL.js", "/build/_shared/chunk-T6J2XV4P.js", "/build/_shared/chunk-V6GYY67B.js", "/build/_shared/chunk-VILKH7TY.js", "/build/_shared/chunk-RR4NJ5KE.js", "/build/_shared/chunk-6HSG7XTY.js", "/build/_shared/chunk-XYUYOA7A.js", "/build/_shared/chunk-NCEHAU4L.js", "/build/_shared/chunk-Z7YULZIH.js", "/build/_shared/chunk-YQXBHU4J.js", "/build/_shared/chunk-MR4RNV3R.js", "/build/_shared/chunk-GI2N4KBY.js", "/build/_shared/chunk-SZPWMCO5.js", "/build/_shared/chunk-2GDX3YAH.js", "/build/_shared/chunk-HTUCWV64.js", "/build/_shared/chunk-TCEARVXY.js", "/build/_shared/chunk-Z6AXIWND.js", "/build/_shared/chunk-LMCMPUVQ.js", "/build/_shared/chunk-5FXFPOX2.js", "/build/_shared/chunk-WYP3H2FD.js", "/build/_shared/chunk-774OMCZR.js", "/build/_shared/chunk-NBSC6XW7.js", "/build/_shared/chunk-CQ24AUPW.js", "/build/_shared/chunk-5ZSDEH4N.js", "/build/_shared/chunk-GMGJK3MR.js", "/build/_shared/chunk-4UOIOKXZ.js", "/build/_shared/chunk-E3BJX6GI.js", "/build/_shared/chunk-GGNTVNB7.js", "/build/_shared/chunk-I65YJ4QN.js", "/build/_shared/chunk-7GUBRWIJ.js", "/build/_shared/chunk-4WS66JBF.js", "/build/_shared/chunk-BFXNYLGG.js", "/build/_shared/chunk-TN2225VX.js", "/build/_shared/chunk-7ME3AMXU.js", "/build/_shared/chunk-3EFZLDUL.js", "/build/_shared/chunk-ZXNGIWOR.js", "/build/_shared/chunk-PJUNGHBU.js", "/build/_shared/chunk-F6SN3YQX.js", "/build/_shared/chunk-JJNOZJPV.js", "/build/_shared/chunk-SUP4S7DH.js", "/build/_shared/chunk-7QV7I6DD.js", "/build/_shared/chunk-JRSTKQLZ.js", "/build/_shared/chunk-6XRRSE7J.js", "/build/_shared/chunk-QED6EHTL.js", "/build/_shared/chunk-OOQIBJPY.js", "/build/_shared/chunk-LGU53J7E.js", "/build/_shared/chunk-JS7RKSJJ.js", "/build/_shared/chunk-TCN7IX6E.js", "/build/_shared/chunk-E4HQ5DYO.js", "/build/_shared/chunk-KXPPKHDA.js", "/build/_shared/chunk-J34RT64S.js", "/build/_shared/chunk-27UCNQHB.js", "/build/_shared/chunk-NIWVQP4L.js", "/build/_shared/chunk-2MQBF6KW.js", "/build/_shared/chunk-CVJWMYET.js", "/build/_shared/chunk-GKZPOANK.js", "/build/_shared/chunk-X4BBBUCM.js", "/build/_shared/chunk-YQ6A7ZUM.js", "/build/_shared/chunk-6UXMWLTK.js", "/build/_shared/chunk-CQR4IMFE.js", "/build/_shared/chunk-BDU2ZUML.js", "/build/_shared/chunk-G7YRGAP3.js", "/build/_shared/chunk-NQKFGVLM.js", "/build/_shared/chunk-I3D7JRIP.js", "/build/_shared/chunk-M2OZFYN7.js", "/build/_shared/chunk-QTNSPCLO.js", "/build/_shared/chunk-742BHR2L.js", "/build/_shared/chunk-CV5S5VRI.js", "/build/_shared/chunk-HHCX4CCT.js", "/build/_shared/chunk-25YI2XQS.js", "/build/_shared/chunk-BJDBBCOY.js", "/build/_shared/chunk-BHVITGKY.js", "/build/_shared/chunk-OYBZT2QD.js", "/build/_shared/chunk-ZDG2VPXG.js", "/build/_shared/chunk-AVJ366R7.js", "/build/_shared/chunk-72ZIPJCL.js", "/build/_shared/chunk-ZTPUC4LI.js", "/build/_shared/chunk-CHSUQ4ND.js", "/build/_shared/chunk-NAH44UAY.js", "/build/_shared/chunk-EHANKJMY.js", "/build/_shared/chunk-UMTVKZO5.js", "/build/_shared/chunk-4MH22FYW.js", "/build/_shared/chunk-FFQ2WFQV.js", "/build/_shared/chunk-YL6HEDYI.js", "/build/_shared/chunk-TZ3SBXU3.js", "/build/_shared/chunk-OBW6ELRI.js", "/build/_shared/chunk-CVVYYINL.js", "/build/_shared/chunk-STSVAWTV.js", "/build/_shared/chunk-TDCS52LA.js", "/build/_shared/chunk-GPD2HVBH.js", "/build/_shared/chunk-7VOVYIOR.js", "/build/_shared/chunk-GG2DVLU7.js", "/build/_shared/chunk-NKZ7WG2F.js", "/build/_shared/chunk-Q644C3ZM.js", "/build/_shared/chunk-R5YHXAJB.js", "/build/_shared/chunk-J77YZUUH.js", "/build/_shared/chunk-FQGFV7S6.js", "/build/_shared/chunk-MLRMLC5W.js", "/build/_shared/chunk-PFX42ENT.js", "/build/_shared/chunk-4MTAX3B7.js", "/build/_shared/chunk-GRACLWR7.js", "/build/_shared/chunk-IN5QRP4J.js", "/build/_shared/chunk-4OI3ONMS.js", "/build/_shared/chunk-HUM7GDMQ.js", "/build/_shared/chunk-EVMRHFSA.js", "/build/_shared/chunk-55J7H5PV.js", "/build/_shared/chunk-5BABC63H.js", "/build/_shared/chunk-EJA7S7FL.js", "/build/_shared/chunk-4F3DN6C2.js", "/build/_shared/chunk-ORHVMQEZ.js", "/build/_shared/chunk-QMIMEQQ7.js", "/build/_shared/chunk-QKHBSJO6.js", "/build/_shared/chunk-5RGFQ75H.js", "/build/_shared/chunk-BZRQRNKW.js", "/build/_shared/chunk-7VE54VCW.js", "/build/_shared/chunk-FLH4NYKM.js", "/build/_shared/chunk-BKYH4IG5.js", "/build/_shared/chunk-CNX46JYZ.js", "/build/_shared/chunk-WZFBIFLU.js", "/build/_shared/chunk-AGFX4QKM.js", "/build/_shared/chunk-NXFCNEHI.js", "/build/_shared/chunk-UCWRDS43.js", "/build/_shared/chunk-JYJVETIU.js", "/build/_shared/chunk-55CWZDEP.js", "/build/_shared/chunk-RNDXAVPV.js", "/build/_shared/chunk-TAMVGRME.js", "/build/_shared/chunk-BVGME64Y.js", "/build/_shared/chunk-SVPVNNLM.js", "/build/_shared/chunk-NEW3EYLA.js", "/build/_shared/chunk-JDD25MLV.js", "/build/_shared/chunk-EI5U3EWW.js", "/build/_shared/chunk-BCTKXJNK.js", "/build/_shared/chunk-NADSVA3P.js", "/build/_shared/chunk-D4C5GOMX.js", "/build/_shared/chunk-TB4MFSJU.js", "/build/_shared/chunk-2UE62OQV.js", "/build/_shared/chunk-QK7F7LV6.js", "/build/_shared/chunk-YOPGZ7DT.js", "/build/_shared/chunk-AWNESVSD.js", "/build/_shared/chunk-FHJKORSF.js", "/build/_shared/chunk-KTKIUP2N.js", "/build/_shared/chunk-FY2MEKS6.js", "/build/_shared/chunk-P3SQ7ISC.js", "/build/_shared/chunk-LDI56K2W.js", "/build/_shared/chunk-7VRO3RGC.js", "/build/_shared/chunk-YE6ZZKFE.js", "/build/_shared/chunk-5CHFHD27.js", "/build/_shared/chunk-EI4MJFEB.js", "/build/_shared/chunk-Y5OC5LXJ.js", "/build/_shared/chunk-QOFGSUOJ.js", "/build/_shared/chunk-ROD7YPKB.js", "/build/_shared/chunk-GJDLOPOZ.js", "/build/_shared/chunk-MDQESUKV.js", "/build/_shared/chunk-B27PKJLJ.js", "/build/_shared/chunk-SZLALUS7.js", "/build/_shared/chunk-3W3CG4HI.js", "/build/_shared/chunk-ILS2U7FD.js", "/build/_shared/chunk-PG45EBB7.js", "/build/_shared/chunk-NWWDDSG6.js", "/build/_shared/chunk-XSUTIV3F.js", "/build/_shared/chunk-4U4XFUZE.js", "/build/_shared/chunk-IEOKYWPS.js", "/build/_shared/chunk-WPQOHXYU.js", "/build/_shared/chunk-2KPSQ4JI.js", "/build/_shared/chunk-MCTX47TO.js", "/build/_shared/chunk-SYHMWHDH.js", "/build/_shared/chunk-UCSE3GNE.js", "/build/_shared/chunk-HRWYEMU3.js", "/build/_shared/chunk-H326XFSM.js", "/build/_shared/chunk-ZS7IAGLI.js", "/build/_shared/chunk-ABOB5II4.js", "/build/_shared/chunk-R7RQKAMU.js", "/build/_shared/chunk-VEOB2ARX.js", "/build/_shared/chunk-PMMWWJWD.js", "/build/_shared/chunk-SI3VXBJI.js", "/build/_shared/chunk-2MJQ2YTJ.js", "/build/_shared/chunk-DNGVS2K7.js", "/build/_shared/chunk-YF5VVCNL.js", "/build/_shared/chunk-YFHAFOGR.js", "/build/_shared/chunk-2XFGHJI5.js", "/build/_shared/chunk-KNBS4RWG.js", "/build/_shared/chunk-ZEL6RK6O.js", "/build/_shared/chunk-JHVZS4LF.js", "/build/_shared/chunk-MGWDYMTH.js", "/build/_shared/chunk-X3WUQR32.js", "/build/_shared/chunk-LO6GUOQO.js", "/build/_shared/chunk-RAV4OOIY.js", "/build/_shared/chunk-VRFV7LT2.js", "/build/_shared/chunk-ZKQKTAHO.js", "/build/_shared/chunk-3ZVNNSWE.js", "/build/_shared/chunk-BKZNFNZU.js", "/build/_shared/chunk-HB7O5XHF.js", "/build/_shared/chunk-QSDWSUKD.js", "/build/_shared/chunk-J76ULVJH.js", "/build/_shared/chunk-VLV5YAZ2.js", "/build/_shared/chunk-W3ECI43U.js", "/build/_shared/chunk-EX7JJ6Y4.js", "/build/_shared/chunk-ULVG3JS3.js", "/build/_shared/chunk-KSHVLVS4.js", "/build/_shared/chunk-E7HOBNAQ.js", "/build/_shared/chunk-PCFBRKVM.js", "/build/_shared/chunk-T43YGBBD.js", "/build/_shared/chunk-IGBJM24X.js", "/build/_shared/chunk-5FZDWD2A.js", "/build/_shared/chunk-VYOFQU6T.js", "/build/_shared/chunk-BFHEGUBO.js", "/build/_shared/chunk-LPB7OZKI.js", "/build/_shared/chunk-R4ZYW5HH.js", "/build/_shared/chunk-L5FZOWGA.js", "/build/_shared/chunk-BDHYV3IN.js", "/build/_shared/chunk-EXD2J3LC.js", "/build/_shared/chunk-O6QJCV2C.js", "/build/_shared/chunk-FDTMDRM4.js", "/build/_shared/chunk-XWZVQ2U2.js", "/build/_shared/chunk-IMMG5R2N.js", "/build/_shared/chunk-35PTE5Y2.js", "/build/_shared/chunk-C56HP5U3.js", "/build/_shared/chunk-2NCJ2OMO.js", "/build/_shared/chunk-WCUTGYEN.js", "/build/_shared/chunk-3I5JAIUQ.js", "/build/_shared/chunk-QXSEZ7RM.js", "/build/_shared/chunk-LWWGEE4G.js", "/build/_shared/chunk-FD65PSGW.js", "/build/_shared/chunk-T33PLEBE.js", "/build/_shared/chunk-5W2S54DT.js", "/build/_shared/chunk-KQFSTETP.js", "/build/_shared/chunk-JJNCUEZF.js", "/build/_shared/chunk-KGF6T672.js", "/build/_shared/chunk-SB57TS6O.js", "/build/_shared/chunk-E2JX3IFB.js", "/build/_shared/chunk-23K75456.js", "/build/_shared/chunk-CTO7HTKE.js", "/build/_shared/chunk-R57USJQ5.js", "/build/_shared/chunk-AVPKQCTS.js", "/build/_shared/chunk-5XV75YAP.js", "/build/_shared/chunk-YRSNOJZW.js", "/build/_shared/chunk-S4LAUDDS.js", "/build/_shared/chunk-JVMWRVME.js", "/build/_shared/chunk-GN2HRNWN.js", "/build/_shared/chunk-V2JHYFQI.js", "/build/_shared/chunk-27E6SFQY.js", "/build/_shared/chunk-IN6KKION.js", "/build/_shared/chunk-TXO2PBRC.js", "/build/_shared/chunk-PIOHKUGS.js", "/build/_shared/chunk-QJHMVXXJ.js", "/build/_shared/chunk-DGIOIJIX.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 }, "routes/posts.create": { id: "routes/posts.create", parentId: "root", path: "posts/create", index: void 0, caseSensitive: void 0, module: "/build/routes/posts.create-ZRWXMLEH.js", imports: ["/build/_shared/chunk-L6YYDTYS.js", "/build/_shared/chunk-XAB7PCAA.js", "/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 }, "routes/privacy": { id: "routes/privacy", parentId: "root", path: "privacy", index: void 0, caseSensitive: void 0, module: "/build/routes/privacy-QJLP4XCL.js", imports: ["/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/profile": { id: "routes/profile", parentId: "root", path: "profile", index: void 0, caseSensitive: void 0, module: "/build/routes/profile-AIJ6ECJZ.js", imports: ["/build/_shared/chunk-PC65EDHQ.js", "/build/_shared/chunk-VI4IRXJP.js", "/build/_shared/chunk-6NZWBXS4.js", "/build/_shared/chunk-DGIOIJIX.js", "/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/profile.activity": { id: "routes/profile.activity", parentId: "routes/profile", path: "activity", index: void 0, caseSensitive: void 0, module: "/build/routes/profile.activity-PJZ4Q5DP.js", imports: ["/build/_shared/chunk-MQYEVBU3.js", "/build/_shared/chunk-5TRFQBKG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/refund-requests": { id: "routes/refund-requests", parentId: "root", path: "refund-requests", index: void 0, caseSensitive: void 0, module: "/build/routes/refund-requests-ZJBNIB5U.js", imports: ["/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/settings": { id: "routes/settings", parentId: "root", path: "settings", index: void 0, caseSensitive: void 0, module: "/build/routes/settings-5SK5WBJM.js", imports: ["/build/_shared/chunk-6NZWBXS4.js", "/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/signup": { id: "routes/signup", parentId: "root", path: "signup", index: void 0, caseSensitive: void 0, module: "/build/routes/signup-Q6DG73QS.js", imports: ["/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/terms": { id: "routes/terms", parentId: "root", path: "terms", index: void 0, caseSensitive: void 0, module: "/build/routes/terms-C6NN623D.js", imports: ["/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/transactions": { id: "routes/transactions", parentId: "root", path: "transactions", index: void 0, caseSensitive: void 0, module: "/build/routes/transactions-JPOT2WV4.js", imports: ["/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/wallet": { id: "routes/wallet", parentId: "root", path: "wallet", index: void 0, caseSensitive: void 0, module: "/build/routes/wallet-B3U7YQGG.js", imports: ["/build/_shared/chunk-L6YYDTYS.js", "/build/_shared/chunk-XAB7PCAA.js", "/build/_shared/chunk-NTHRJKQW.js", "/build/_shared/chunk-Y3IVF2DN.js", "/build/_shared/chunk-3N6QMJTG.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !0 } }, version: "a9b4c7b0", hmr: void 0, url: "/build/manifest-A9B4C7B0.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "production", assetsBuildDirectory = "public\\build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/api.wallet.cancel-transaction": {
    id: "routes/api.wallet.cancel-transaction",
    parentId: "root",
    path: "api/wallet/cancel-transaction",
    index: void 0,
    caseSensitive: void 0,
    module: api_wallet_cancel_transaction_exports
  },
  "routes/api.comments.$commentId.vote": {
    id: "routes/api.comments.$commentId.vote",
    parentId: "root",
    path: "api/comments/:commentId/vote",
    index: void 0,
    caseSensitive: void 0,
    module: api_comments_commentId_vote_exports
  },
  "routes/api.answers.$answerId.vote": {
    id: "routes/api.answers.$answerId.vote",
    parentId: "root",
    path: "api/answers/:answerId/vote",
    index: void 0,
    caseSensitive: void 0,
    module: api_answers_answerId_vote_exports
  },
  "routes/api.wallet.confirm-deposit": {
    id: "routes/api.wallet.confirm-deposit",
    parentId: "root",
    path: "api/wallet/confirm-deposit",
    index: void 0,
    caseSensitive: void 0,
    module: api_wallet_confirm_deposit_exports
  },
  "routes/api.posts.$postId.vote": {
    id: "routes/api.posts.$postId.vote",
    parentId: "routes/api.posts.$postId",
    path: "vote",
    index: void 0,
    caseSensitive: void 0,
    module: api_posts_postId_vote_exports
  },
  "routes/api.bookmarks-status": {
    id: "routes/api.bookmarks-status",
    parentId: "root",
    path: "api/bookmarks-status",
    index: void 0,
    caseSensitive: void 0,
    module: api_bookmarks_status_exports
  },
  "routes/api.bookmarks-toggle": {
    id: "routes/api.bookmarks-toggle",
    parentId: "root",
    path: "api/bookmarks-toggle",
    index: void 0,
    caseSensitive: void 0,
    module: api_bookmarks_toggle_exports
  },
  "routes/api.integrity.report": {
    id: "routes/api.integrity.report",
    parentId: "root",
    path: "api/integrity/report",
    index: void 0,
    caseSensitive: void 0,
    module: api_integrity_report_exports
  },
  "routes/api.profile.picture": {
    id: "routes/api.profile.picture",
    parentId: "root",
    path: "api/profile/picture",
    index: void 0,
    caseSensitive: void 0,
    module: api_profile_picture_exports
  },
  "routes/api.refund.requests": {
    id: "routes/api.refund.requests",
    parentId: "root",
    path: "api/refund/requests",
    index: void 0,
    caseSensitive: void 0,
    module: api_refund_requests_exports
  },
  "routes/api.wallet.withdraw": {
    id: "routes/api.wallet.withdraw",
    parentId: "root",
    path: "api/wallet/withdraw",
    index: void 0,
    caseSensitive: void 0,
    module: api_wallet_withdraw_exports
  },
  "routes/api.integrity.rate": {
    id: "routes/api.integrity.rate",
    parentId: "root",
    path: "api/integrity/rate",
    index: void 0,
    caseSensitive: void 0,
    module: api_integrity_rate_exports
  },
  "routes/api.refund.request": {
    id: "routes/api.refund.request",
    parentId: "root",
    path: "api/refund/request",
    index: void 0,
    caseSensitive: void 0,
    module: api_refund_request_exports
  },
  "routes/api.wallet.deposit": {
    id: "routes/api.wallet.deposit",
    parentId: "root",
    path: "api/wallet/deposit",
    index: void 0,
    caseSensitive: void 0,
    module: api_wallet_deposit_exports
  },
  "routes/default-avatar.png": {
    id: "routes/default-avatar.png",
    parentId: "root",
    path: "default-avatar/png",
    index: void 0,
    caseSensitive: void 0,
    module: default_avatar_png_exports
  },
  "routes/docs.refund-system": {
    id: "routes/docs.refund-system",
    parentId: "routes/docs",
    path: "refund-system",
    index: void 0,
    caseSensitive: void 0,
    module: docs_refund_system_exports
  },
  "routes/api.posts.$postId": {
    id: "routes/api.posts.$postId",
    parentId: "root",
    path: "api/posts/:postId",
    index: void 0,
    caseSensitive: void 0,
    module: api_posts_postId_exports
  },
  "routes/api.bounty.claim": {
    id: "routes/api.bounty.claim",
    parentId: "root",
    path: "api/bounty/claim",
    index: void 0,
    caseSensitive: void 0,
    module: api_bounty_claim_exports
  },
  "routes/api.posts.delete": {
    id: "routes/api.posts.delete",
    parentId: "root",
    path: "api/posts/delete",
    index: void 0,
    caseSensitive: void 0,
    module: api_posts_delete_exports
  },
  "routes/profile.activity": {
    id: "routes/profile.activity",
    parentId: "routes/profile",
    path: "activity",
    index: void 0,
    caseSensitive: void 0,
    module: profile_activity_exports
  },
  "routes/$username.posts": {
    id: "routes/$username.posts",
    parentId: "routes/$username",
    path: "posts",
    index: void 0,
    caseSensitive: void 0,
    module: username_posts_exports
  },
  "routes/api.privacy.pdf": {
    id: "routes/api.privacy.pdf",
    parentId: "root",
    path: "api/privacy/pdf",
    index: void 0,
    caseSensitive: void 0,
    module: api_privacy_pdf_exports
  },
  "routes/api.refund.vote": {
    id: "routes/api.refund.vote",
    parentId: "root",
    path: "api/refund/vote",
    index: void 0,
    caseSensitive: void 0,
    module: api_refund_vote_exports
  },
  "routes/refund-requests": {
    id: "routes/refund-requests",
    parentId: "root",
    path: "refund-requests",
    index: void 0,
    caseSensitive: void 0,
    module: refund_requests_exports
  },
  "routes/api.terms.pdf": {
    id: "routes/api.terms.pdf",
    parentId: "root",
    path: "api/terms/pdf",
    index: void 0,
    caseSensitive: void 0,
    module: api_terms_pdf_exports
  },
  "routes/docs.platform": {
    id: "routes/docs.platform",
    parentId: "routes/docs",
    path: "platform",
    index: void 0,
    caseSensitive: void 0,
    module: docs_platform_exports
  },
  "routes/posts.$postId": {
    id: "routes/posts.$postId",
    parentId: "root",
    path: "posts/:postId",
    index: void 0,
    caseSensitive: void 0,
    module: posts_postId_exports
  },
  "routes/posts.create": {
    id: "routes/posts.create",
    parentId: "root",
    path: "posts/create",
    index: void 0,
    caseSensitive: void 0,
    module: posts_create_exports
  },
  "routes/transactions": {
    id: "routes/transactions",
    parentId: "root",
    path: "transactions",
    index: void 0,
    caseSensitive: void 0,
    module: transactions_exports
  },
  "routes/docs.legal": {
    id: "routes/docs.legal",
    parentId: "routes/docs",
    path: "legal",
    index: void 0,
    caseSensitive: void 0,
    module: docs_legal_exports
  },
  "routes/$username": {
    id: "routes/$username",
    parentId: "root",
    path: ":username",
    index: void 0,
    caseSensitive: void 0,
    module: username_exports
  },
  "routes/community": {
    id: "routes/community",
    parentId: "root",
    path: "community",
    index: void 0,
    caseSensitive: void 0,
    module: community_exports
  },
  "routes/settings": {
    id: "routes/settings",
    parentId: "root",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: settings_exports
  },
  "routes/privacy": {
    id: "routes/privacy",
    parentId: "root",
    path: "privacy",
    index: void 0,
    caseSensitive: void 0,
    module: privacy_exports
  },
  "routes/profile": {
    id: "routes/profile",
    parentId: "root",
    path: "profile",
    index: void 0,
    caseSensitive: void 0,
    module: profile_exports
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: logout_exports
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "root",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: signup_exports
  },
  "routes/wallet": {
    id: "routes/wallet",
    parentId: "root",
    path: "wallet",
    index: void 0,
    caseSensitive: void 0,
    module: wallet_exports
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: index_exports
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: login_exports
  },
  "routes/terms": {
    id: "routes/terms",
    parentId: "root",
    path: "terms",
    index: void 0,
    caseSensitive: void 0,
    module: terms_exports
  },
  "routes/docs": {
    id: "routes/docs",
    parentId: "root",
    path: "docs",
    index: void 0,
    caseSensitive: void 0,
    module: docs_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
/*! Bundled license information:

bcryptjs/dist/bcrypt.js:
  (**
   * @license bcrypt.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
   * Released under the Apache License, Version 2.0
   * see: https://github.com/dcodeIO/bcrypt.js for details
   *)
*/
