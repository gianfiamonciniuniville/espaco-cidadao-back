import { Router } from "express";

import Service from '../services/department'

const router = Router();
const service = new Service()

// router.get('/:id', service.findOne)
// router.patch('/:id', service.update)
router.delete('/:id', service.remove)

router.post('/', service.new)
router.get('/', service.findAll)

export default router;
