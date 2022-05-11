const httpStatus = require('http-status');
const decode = require('jwt-decode');
const urlBuilder = require('url');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');

const reauthorize = catchAsync(async (req, res) => {
  const { state, jwt } = req.query;
  const decodedJwt = decode(jwt);

  // eslint-disable-next-line no-shadow
  const generateAuthorizationRequest = (decodedJwt) => {
    const authorizationRequest = urlBuilder.format({
      protocol: 'https',
      hostname: decodedJwt.host,
      pathname: decodedJwt.path,
      query: decodedJwt.query,
    });
    return authorizationRequest;
  };

  res.cookie('redirectState', state, {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: false, // Indicates if the cookie should be signed
  });

  //   res.status(httpStatus.OK).send(generateAuthorizationRequest(decodedJwt));
  res.redirect(generateAuthorizationRequest(decodedJwt));
});

const callback = catchAsync(async (req, res) => {
  const { redirectState } = req.cookies;
  const auth0Domain = 'preprod-auth.ntuclink.com.sg';
  logger.info(JSON.stringify(req.cookies, null, 2));
  const idToken = req.body.id_token;
  const actionUrl = `https://${auth0Domain}/continue?state=${redirectState}`;
  res.set('Content-Type', 'text/html');
  res.set('Content-Security-Policy', `script-src 'self' 'sha256-pXCAFruc8kpNZJcdk8V1UnsYXpT24YR/ngpSnkTrTr8='`);
  res.send(
    Buffer.from(
      `<html><head></head><body><form id="redirectionPostForm" method="POST" action=${actionUrl}><input type="hidden" name="id_token" value=${idToken}></input></form><script language="javascript" type="text/javascript">document.getElementById("redirectionPostForm").submit();</script></body></html>`
    )
  );
});

module.exports = {
  reauthorize,
  callback,
};
