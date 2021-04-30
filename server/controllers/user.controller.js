import User from '../models/user.model'
import extend from 'lodash/extend' //модуль для расширения и объединения изменений, которые поступили в теле запроса, для обновления пользователя
import errorHandler from './../helpers/dbErrorHandler'

const create = async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    return res.status(200).json({
      message: "Successfully signed up!"
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Load user and append to req.
 */
const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
    if (!user)
      return res.status('400').json({
        error: "User not found"
      })
    req.profile = user  //если пользователь найден, next() передаст управление read()
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve user"
    })
  }
}

// Когда приложение Express получает запрос GET в '/ api / users /: userId', оно выполняет
// Функцию контроллера userByID для загрузки пользователя по значению userId в параметре, а затем
// функция контроллера чтения.

const read = (req, res) => {
  req.profile.hashed_password = undefined //извлекает сведения из req.profile и удаляет конфиденциальные данне
  req.profile.salt = undefined //удаляет конфиденциальные данне
  return res.json(req.profile)
}


const list = async (req, res) => {
  try {
    let users = await User.find().select('name email updated created')
    res.json(users)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

// Когда приложение Express получает запрос PUT в '/ api / users /: userId', аналогично read,
// сначала он загружает пользователя со значением параметра: userId, а затем обновляет контроллер
// функция выполняется.

const update = async (req, res) => {
  try {
    let user = req.profile //извлекает данные пользователя
    user = extend(user, req.body) //loadsh module см выше
    user.updated = Date.now() //метка сохранения
    await user.save()
    user.hashed_password = undefined //затираем конф. данные
    user.salt = undefined
    res.json(user)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let user = req.profile
    let deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update
}
