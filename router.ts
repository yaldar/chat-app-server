/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import express from 'express';
import util from './util';

const router = express.Router();

router.get('/api/users', (_req, res) => {
  res
    // .json(util.getUsers().map((user) => user.nickname))
    .json(util.getNicknames())
    .status(200)
    .end();
});

router.get('/api/users/:nickname', (req, res) => {
  const nickname = req.params.nickname;
  const found = util.getNicknames().find((el) => el === nickname);

  if (found) {
    res.status(409).end();
  } else {
    res.status(200).end();
  }
});

router.use((req, res) => {
  res.status(404).json({ message: 'Page Not Found' });
});

export default router;
