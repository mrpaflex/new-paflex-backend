// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor() {
//     super(ENVIRONMENT.GoogleSuperMethod);
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: VerifyCallback,
//   ) {
//     const { name, emails, photos } = profile;
//     const user = {
//       email: emails[0].value,
//       firstName: name.givenName,
//       lastName: name.familyName,
//       picture: photos[0].value,
//       accessToken,
//       refreshToken,
//     };
//     //return user
//     done(null, user);
//   }
// }
