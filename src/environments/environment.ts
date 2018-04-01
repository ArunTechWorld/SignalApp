import { EnvInterface } from './env';

export const ENV = {

  production: true,
  isDebugMode: false,
  isWebBuild: false,
  baseUrl: 'https://colt.calamp-ts.com',
  appversion: '0.65.1',

  // DEV
  // apiUrl: 'https://sd.e4o4.com/api/dev/',
  // esriApiUrl: 'https://devgis.connect.calamp.com/server/rest/services/SDCTCDEV/',
  // adminRoleId: 6753,
  // userRoleId: 6754,
  // REPORT_API_AUTH_URL: 'https://dev.connect.calamp.com/connect/services/login?useAuthToken=true',
  // REPORT_API_REGISTER_URL: 'https://dev.connect.calamp.com/reporting/registertoken/CONNECT/',
  // REPORT_API_TOKEN_URL: 'https://dev.connect.calamp.com/reporting/jasperOptions/?accountId=',
  // REPORT_DATA_URL: 'https://reporting-dev.calamp.com/jasperserver-pro/rest_v2/reports/organizations/organization_1/reports/CONNECT/Reports/aggregate_miles_driven_by_vehicles.json',
  // REPORT_APP_KEY: '2949663f-615c-4c18-ae9b-b25ff50ca3af',

  /* adminRoleId: 2563,
  userRoleId: 2564, */

  LOW_PRIORITY_API_RETRY: 1,
  MEDIUM_PRIORITY_API_RETRY: 3,
  HIGH_PRIORITY_API_RETRY: 5,
  CRITICAL_PRIORITY_API_RETRY: 10,
  TRIPWIRE_API_RETRY_DELAY: 2000,
  DEPLOY_GEOZONE_RETRY_DELAY: 2000,
  REPORT_API_SESSION_AGE: 15,
  API_RETRY_DELAY: 200,
  MAX_PAGE_SIZE: 10,
  SENDER_ID: '191852817110',
  PUSH_NOTIFICATION_AUTOCLOSE_DELAY: 10000,

  // QA
  apiUrl: 'https://sd.e4o4.com/api/qa/',
  esriApiUrl: 'https://devgis.connect.calamp.com/server/rest/services/SDCTCQA/',
  adminRoleId: 2563,
  userRoleId: 2564,
  REPORT_API_AUTH_URL: 'https://qa.connect.calamp.com/connect/services/login?useAuthToken=true',
  REPORT_API_REGISTER_URL: 'https://qa.connect.calamp.com/reporting/registertoken/CONNECT_QA_AWS/',
  REPORT_API_TOKEN_URL: 'https://qa.connect.calamp.com/reporting/jasperOptions/?accountId=',
  REPORT_DATA_URL: 'https://reporting-qa.calamp.com/jasperserver-pro/rest_v2/reports/organizations/organization_1/reports/CONNECT/Reports/aggregate_miles_driven_by_vehicles.json',
  REPORT_APP_KEY: 'd1bddf4e-efe3-494e-996c-72813d5d969e',
  // PROD
  // REPORT_APP_KEY: 'ee9ffeba-fcef-415e-8407-4544fa439e21',

};
