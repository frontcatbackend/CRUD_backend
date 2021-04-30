import express from 'express'
import authCtrl from '../controllers/auth.controller'

const router = express.Router()

// Когда приложение Express получает запрос POST в '/ auth / signin', оно выполняет signin()
// функциЮ контроллера.

router.route('/auth/signin')
  .post(authCtrl.signin)
router.route('/auth/signout')
  .get(authCtrl.signout)

export default router
