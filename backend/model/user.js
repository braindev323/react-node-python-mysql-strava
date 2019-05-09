var bcrypt = require('bcrypt-nodejs')
var crypto = require('crypto')
var Constants = require('../config/contants')

var db = require('./db');
var _ = require('lodash')
// Set up User class
var User = function (param) {
  let tempObj = new Object();
  if (param) {
    let user = param.athlete
    let userRole = user.id == process.env.ADMIN_ID ? "admin" : "user"
    tempObj.userId = user.id;
    tempObj.username = user.username;
    tempObj.refresh_token = param.refresh_token;
    tempObj.access_token = param.access_token;
    tempObj.expiretime = param.expires_at;
    tempObj.role = userRole;
  }

  return tempObj;
};

var UserProfile = function (profile) {
  let tempObj = new Object()
  let user = profile.athlete;
  if (profile) {
    // user.id ? tempObj.userId = user.id : null
    tempObj.username = user.username
    tempObj.firstname = user.firstname
    tempObj.lastname = user.lastname
    tempObj.sex = user.sex

    user.badge_type_id ? tempObj.badge_type_id = user.badge_type_id : null
    user.premium ? tempObj.premium = user.premium : null
    user.resource_state ? tempObj.resource_state = user.resource_state : null
    user.summit ? tempObj.summit = user.summit : null
    user.profile ? tempObj.profile = user.profile : null
    user.profile_medium ? tempObj.profile_medium = user.profile_medium : null
    user.city ? tempObj.city = user.city : null
    user.country ? tempObj.country = user.country : null
    user.follower ? tempObj.follower = user.follower : null
    user.friend ? tempObj.friend = user.friend : null
    user.created_at ? tempObj.created_at = user.created_at : null
    user.updated_at ? tempObj.updated_at = user.updated_at : null

    profile.age ? tempObj.age = profile.age : null
    profile.height ? tempObj.height = profile.height : null
    profile.weight ? tempObj.weight = profile.weight : null
    profile.HeartRateThresholdpoint ? tempObj.HeartRateThresholdpoint = profile.HeartRateThresholdpoint : null
    profile.HeartRateMaximum ? tempObj.HeartRateMaximum = profile.HeartRateMaximum : null
    profile.HeartRaterestpulse ? tempObj.HeartRaterestpulse = profile.HeartRaterestpulse : null

    profile.hrzone0min ? tempObj.hrzone0min = profile.hrzone0min : null
    profile.hrzone0max ? tempObj.hrzone0max = profile.hrzone0max : null
    profile.hrzone1min ? tempObj.hrzone1min = profile.hrzone1min : null
    profile.hrzone1max ? tempObj.hrzone1max = profile.hrzone1max : null
    profile.hrzone2min ? tempObj.hrzone2min = profile.hrzone2min : null
    profile.hrzone2max ? tempObj.hrzone2max = profile.hrzone2max : null
    profile.hrzone3min ? tempObj.hrzone3min = profile.hrzone3min : null
    profile.hrzone3max ? tempObj.hrzone3max = profile.hrzone3max : null
    profile.hrzone4min ? tempObj.hrzone4min = profile.hrzone4min : null
    profile.hrzone4max ? tempObj.hrzone4max = profile.hrzone4max : null
    profile.hrzone5min ? tempObj.hrzone5min = profile.hrzone5min : null
    profile.hrzone5max ? tempObj.hrzone5max = profile.hrzone5max : null
    profile.vo2max ? tempObj.vo2max = profile.vo2max : null
    profile.Goalsfor2019 ? tempObj.Goalsfor2019 = profile.Goalsfor2019 : null
    profile.Eventsplanned2019 ? tempObj.Eventsplanned2019 = profile.Eventsplanned2019 : null
    profile.bikeSelect ? tempObj.bikeSelect = profile.bikeSelect : null
    profile.hrsensorSelect ? tempObj.hrsensorSelect = profile.hrsensorSelect : null
    profile.powermeterSelect ? tempObj.powermeterSelect = profile.powermeterSelect : null

    profile.slopecat && profile.outputcols ? tempObj.systemsetting = JSON.stringify(systemDataToJson(profile)) : null
  }
  return tempObj;

}

var propertyToHrCat = (profile) => {
  var hrCat;
  try {
    hrCat = `${profile.hrzone0min},${0.75 * profile.hrzone0max},${profile.hrzone0max},${0.5 * profile.hrzone1max},${profile.hrzone1max},${0.5 * profile.hrzone2max},${profile.hrzone2max},${0.5 * profile.hrzone3max},${profile.hrzone3max},${0.5 * profile.hrzone4max},${profile.hrzone4max},${0.5 * profile.hrzone5max},${profile.hrzone5max}`
  } catch (err) {
    hrCat = "80,100,110,120,130,140,150,160,170,180,190,200,200"
  }
  return hrCat
}

var propertyToHrWeight = (profile) => {
  return "0.7, 0.7, 0.8, 0.8, 1, 1, 1, 1.2, 1.2, 1.4, 1.4, 1.8"
}
var propertyToUserDataJson = (profile) => {
  const { athlete, weight, age } = profile;
  var tempJson = { firstname: "", lastname: "", gender: "M", weight: "0", age: "0", length: "1.80", shape: "na", hrcat: "", send: "Update user settings" }

  var hrcat = propertyToHrCat(profile);
  try {
    tempJson.firstname = athlete.firstname;
    tempJson.lastname = athlete.lastname;
    tempJson.gender = athlete.sex;
    tempJson.weight = "" + weight;
    tempJson.age = "" + age;
    tempJson.length = "1.80";
    tempJson.shape = "na"
    tempJson.hrcat = hrcat;
    tempJson.send = "Update user settings"
  } catch (err) {
    console.log(err)
  }
  return tempJson
}

var systemDataToJson = (profile) => {
  var { slopecat, outputcols } = profile
  var tempJson = { slopecat: "", outputcols: "", hrweight: "", airresist: "0.7", rolresist: "0.006", surfarea: "0.5", seglen: "100", negzero: 0, send: "Update system settings" }
  if (slopecat)
    tempJson.slopecat = _.split(slopecat, "=")[1].trim();
  if (outputcols)
    tempJson.outputcols = _.split(outputcols, "=")[1].trim();
  tempJson.hrweight = propertyToHrWeight(profile);
  return tempJson;
}

var getUserList = function (projection, callback) {
  if (projection === '') projection = '*'
  db.query('SELECT ' + projection + ' FROM user', [], function (err, rows) {
    if (err) return callback(err)
    return callback(err, rows);
  });
}
var getUserById = (projection, id, callback) => {
  if (projection === '') projection = "*";
  db.query('SELECT ' + projection + ' FROM client WHERE id = ?', [id], function (err, rows) {
    if (err) return callback(err)
    return callback(err, rows[0]);
  });
}
var getUserByEmail = (projection, email, callback) => {
  if (projection === '') projection = "*";
  db.query('SELECT ' + projection + ' FROM client WHERE email = ?', [email], function (err, rows) {
    if (err) return callback(err)
    return callback(err, rows[0]);
  });
}


var getUser = function (projection, params, callback) {
  if (projection === '') projection = '*'
  db.query('SELECT ' + projection + ' FROM user INNER JOIN user_profile ON user.clientId = user_profile.clientId INNER JOIN client ON user.clientId = client.id WHERE user.clientId = ?', [params.id], function (err, rows) {
    if (err) return callback(err)
    return callback(err, rows);
  });
}
var changePassword = (params, callback) => {
  const { id, newpassword } = params
  db.query("SELECT * FROM client WHERE id = ?", [id], (err, rows) => {
    if (err)
      return callback(err, null, null);//change faild
    if (!rows.length) {
      return callback(null, true, null); //not registered already
    }
    // var id = rows[0]["id"];
    var encoded_password = bcrypt.hashSync(newpassword);
    db.query("UPDATE client SET ? WHERE id = ?", [{ password: encoded_password }, id], (err, response) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // If we somehow generated a duplicate user id, try again
          // return setEmailVerified(id, callback);
        }

        return callback(err, false)
      }
      return callback(err, false, response)
    })
  })
}
var loginEmailUser = (params, callback) => {
  const { email, password } = params
  db.query("SELECT * FROM client WHERE email = ?", [email], (err, rows) => {
    if (err)
      return callback(err, null, null);//register faild
    if (!rows.length) {
      return callback(null, true, null); //not registered already
    }
    if (bcrypt.compareSync(password, rows[0]["password"])) {
      return callback(null, false, rows[0]) //success
    }
    return callback(null, false, null); //password wrong

  })
}

var setEmailVerified = (id, callback) => {
  db.query('UPDATE client SET ? WHERE id = ?', [{ verified: true }, id]
    , function (err) {

      let msg = ''

      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // If we somehow generated a duplicate user id, try again
          return setEmailVerified(id, callback);
        }
        msg = Constants.EMAIL_VERIFY_FAILED;
        return callback(err, msg)
      }
      msg = Constants.EMAIL_VERIFY_SUCESS;
      return callback(err, msg)
    })
}
var registerEmailUser = (params, callback) => {
  var { email, password } = params;

  db.query('SELECT * FROM client WHERE email = ?', [email], (err, rows) => {
    if (err)
      return callback(err, false, null);//register faild
    if (rows.length) {
      return callback(null, true, null); //registered already
    }

    var encoded_password = bcrypt.hashSync(password);
    var role = email === process.env.ADMIN_EMAIL ? "admin" : "user"
    db.query(`INSERT INTO client (email,password,role) values (?,?,?)`,
      [email, encoded_password, role],
      function (err, response) {
        if (err) {

          if (err.code === 'ER_DUP_ENTRY') {
            // If we somehow generated a duplicate user id, try again
            return registerEmailUser(params, callback);
          }
          return callback(err, false, null); // register faild
        }
        // Successfully created user
        // // create profile
        var clientId = response.insertId
        db.query(`INSERT INTO user (clientId) values (?)`,
          [clientId],
          function (err) {
            let msg = ''
            if (err) {

              if (err.code === 'ER_DUP_ENTRY') {
                // If we somehow generated a duplicate user id, try again
                // return insertUser(params, callback);
              }
              msg = Constants.USER_REGISTRATION_FAILED
              return callback(err, false);
            }
            // create user_profie
            db.query(`INSERT INTO user_profile (clientId) values (?)`,
              [clientId],
              function (err) {
                if (err) {
                  let msg = ''
                  if (err.code === 'ER_DUP_ENTRY') {
                    // return insertUserProfile(user, callback);
                  }
                  msg = Constants.USER_REGISTRATION_FAILED
                }
                msg = Constants.USER_REGISTRATION_OK
                // Successfully created user
                return callback(err, false, response) //success               
              }
            )
          }
        )
      }
    )

  })
}

var stravaRegisterUser = function (params, callback) {
  var { user } = params
  db.query('SELECT * FROM user WHERE clientId = ? ', [user.id], function (err, rows) {
    if (err) {
      callback(err);
    }
    if (rows.length) {
      return updateUser(params, callback);
    }
    return insertUser(params, callback);//optional
  });
}

var updateUser = function (params, callback) {
  var { user } = params
  db.query('UPDATE user SET ? WHERE clientId = ?', [new User(params), user.id]
    , function (err) {

      let msg = ''

      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // If we somehow generated a duplicate user id, try again
          return updateUser(params, callback);
        }
        msg = Constants.USER_REGISTRATION_FAILED;
        return callback(err, msg)
      }
      msg = Constants.USER_UPDATE_OK
      return callback(err, msg)
      return updateUserProfile(params, callback);

    })
}

var insertUser = function (params, callback) {
  let user = params.athlete
  let userRole = user.id == process.env.ADMIN_ID ? "admin" : "user"
  db.query(`INSERT INTO user (userId,username,access_token,refresh_token,expiretime,role) values (?,?,?,?,?,?)`,
    [user.id, user.username, params.access_token, params.refresh_token, params.expires_at, userRole],
    function (err) {
      let msg = ''
      if (err) {

        if (err.code === 'ER_DUP_ENTRY') {
          // If we somehow generated a duplicate user id, try again
          return insertUser(params, callback);
        }
        msg = Constants.USER_REGISTRATION_FAILED
        return callback(err, msg);
      }
      // Successfully created user
      msg = Constants.USER_REGISTRATION_OK
      return callback(err, msg)
      return insertUserProfile(user, callback);
    }
  )
}

var updateUserProfile = function (profile, callback) {
  let clientId = profile.clientId || profile.user.id
  db.query(`UPDATE user_profile SET ? WHERE clientId =?`, [new UserProfile(profile), clientId],
    function (err) {
      let msg = ''
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return updateUserProfile(profile, callback);
        }
        msg = Constants.USER_UPDATE_FAILED
      } else
        msg = Constants.USER_UPDATE_OK
      // Successfully created user
      return callback(err, msg);
    }
  )
}

var insertUserProfile = function (user, callback) {

  db.query(`INSERT INTO user_profile (userId, username, firstname, lastname, badge_type_id, premium, resource_state, summit, sex, profile, profile_medium, city ,country,follower, friend, created_at, updated_at ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [user.id, user.username, user.firstname, user.lastname, user.badge_type_id, user.premium, user.resource_state, user.summit, user.sex, user.profile, user.profile_medium, user.city, user.country, user.follower, user.friend, user.created_at, user.updated_at],
    function (err) {
      if (err) {
        let msg = ''
        if (err.code === 'ER_DUP_ENTRY') {
          return insertUserProfile(user, callback);
        }
        msg = Constants.USER_REGISTRATION_FAILED
      }
      msg = Constants.USER_REGISTRATION_OK
      // Successfully created user
      return callback(err, msg);
    }
  )
}


var deleteUser = function (username, callback) {

  db.query('DELETE FROM users WHERE username = ?',
    [username]
    , function (err) {
      return callback(err);
    });


}

exports.loginEmailUser = loginEmailUser
exports.insertUserProfile = insertUserProfile
exports.insertUser = insertUser
exports.updateUser = updateUser
exports.getUser = getUser
exports.registerEmailUser = registerEmailUser
exports.stravaRegisterUser = stravaRegisterUser
exports.getUserList = getUserList
exports.updateUserProfile = updateUserProfile
exports.getUserById = getUserById
exports.setEmailVerified = setEmailVerified
exports.changePassword = changePassword
exports.getUserByEmail = getUserByEmail

