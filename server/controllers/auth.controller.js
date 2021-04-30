import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from './../../config/config'

const signin = async (req, res) => {
  try {
    let user = await User.findOne({
      "email": req.body.email
    })
    if (!user)
      return res.status('401').json({
        error: "User not found"
      })

    if (!user.authenticate(req.body.password)) {
      return res.status('401').send({
        error: "Email and password don't match."
      })
    }

// Если пароль успешно проверен, модуль JWT используется для создания подписанного JWT
        // используя секретный ключ и значение _id пользователя


    const token = jwt.sign({
      _id: user._id
    }, config.jwtSecret)
 // При желании мы также можем установить токен в файл cookie в объекте ответа
    res.cookie("t", token, {
      expire: new Date() + 9999 //токен живёт 2 часа
    })

    // JWT возвращается аутентифицированному клиенту вместе с данными пользователя.
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (err) {

    return res.status('401').json({
      error: "Could not sign in"
    })

  }
}
// Функция выхода очищает ответный cookie, содержащий подписанный JWT.
const signout = (req, res) => {
  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out"
  })
}

//requireSignin защита роутов 
// использует express-jwt, чтобы убедиться, что
// входящий запрос имеет действительный JWT в заголовке авторизации
// eсли токен действителен, он
// добавляет подтвержденный идентификатор пользователя в ключ 'auth' к объекту запроса, в противном случае он выбрасывает
// ошибка аутентификации
// Мы можем добавить requireSignin к любому маршруту, который должен быть защищен от неаутентифицированных
// доступ.

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  algorithms: ['RS256'],
  userProperty: 'auth'
})


//проверяет, свою ли информацию ты удаляешь?
//id профиля и токен должны совпадать
const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}
