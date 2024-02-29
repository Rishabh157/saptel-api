const { userRoleType } = require("../../helper/enumUtils");

exports.getSeniorUserRole = async (userRole) => {
  let seniorUserRole;
  switch (userRole) {
    case userRoleType.avpSales:
      seniorUserRole = null;
      break;
    case userRoleType.agmSale:
      seniorUserRole = userRoleType.avpSales;
      break;
    case userRoleType.managerSalesCenter:
      seniorUserRole = userRoleType.agmSale;
      break;
    case userRoleType.asstManagerSalesCenter:
      seniorUserRole = userRoleType.managerSalesCenter;
      break;
    case userRoleType.srTeamLeaderOrSrEXECUTIVEMIS:
      seniorUserRole = userRoleType.asstManagerSalesCenter;
      break;
    case userRoleType.teamLeaderOrEXECUTIVESalesCenter:
      seniorUserRole = userRoleType.srTeamLeaderOrSrEXECUTIVEMIS;
      break;
    case userRoleType.srEXECUTIVESalesCenter:
      seniorUserRole = userRoleType.teamLeaderOrEXECUTIVESalesCenter;
      break;
    case userRoleType.executiveSalesCenter:
      seniorUserRole = userRoleType.srEXECUTIVESalesCenter;
      break;
    case userRoleType.EXECUTIVETrainee:
      seniorUserRole = userRoleType.executiveSalesCenter;
      break;
    case userRoleType.avpHr:
      seniorUserRole = null;
      break;
    case userRoleType.amgHrAndStatutoryCompliance:
      seniorUserRole = userRoleType.avpHr;
      break;
    case userRoleType.asstManagerHr:
      seniorUserRole = userRoleType.amgHrAndStatutoryCompliance;
      break;
    case userRoleType.srEXECUTIVEHr:
      seniorUserRole = userRoleType.asstManagerHr;
      break;
    case userRoleType.EXECUTIVEHr:
      seniorUserRole = userRoleType.srEXECUTIVEHr;
      break;
    case userRoleType.avpDistribution:
      seniorUserRole = null;
      break;
    case userRoleType.srManagerDistribution:
      seniorUserRole = userRoleType.avpDistribution;
      break;
    case userRoleType.managerArea:
      seniorUserRole = userRoleType.srManagerDistribution;
      break;
    case userRoleType.srEXECUTIVEArea:
      seniorUserRole = userRoleType.managerArea;
      break;
    case userRoleType.EXECUTIVEArea:
      seniorUserRole = userRoleType.srEXECUTIVEArea;
      break;
    case userRoleType.avpFinance:
      seniorUserRole = null;
      break;
    case userRoleType.agmFinance:
      seniorUserRole = userRoleType.avpFinance;
      break;
    case userRoleType.srManagerFinance:
      seniorUserRole = userRoleType.agmFinance;
      break;
    case userRoleType.managerFinance:
      seniorUserRole = userRoleType.srManagerFinance;
      break;
    case userRoleType.amFinance:
      seniorUserRole = userRoleType.managerFinance;
      break;
    case userRoleType.EXECUTIVEFinance:
      seniorUserRole = userRoleType.amFinance;
      break;
    case userRoleType.avpMedia:
      seniorUserRole = null;
      break;
    case userRoleType.agmMediaPlanningAndProcurement:
      seniorUserRole = userRoleType.avpMedia;
      break;
    case userRoleType.amMedia:
      seniorUserRole = userRoleType.agmMediaPlanningAndProcurement;
      break;
    case userRoleType.EXECUTIVEMedia:
      seniorUserRole = userRoleType.amMedia;
      break;
    case userRoleType.avpMediaProduction:
      seniorUserRole = null;
      break;
    case userRoleType.srManagerMediaProduction:
      seniorUserRole = userRoleType.avpMediaProduction;
      break;
    case userRoleType.srEditor:
      seniorUserRole = userRoleType.srManagerMediaProduction;
      break;
    case userRoleType.videoEditor:
      seniorUserRole = userRoleType.srEditor;
      break;
    case userRoleType.associateAditor:
      seniorUserRole = userRoleType.videoEditor;
      break;
    case userRoleType.avpIT:
      seniorUserRole = null;
      break;
    case userRoleType.managerSystemAndNetwork:
      seniorUserRole = userRoleType.avpIT;
      break;
    case userRoleType.managerServerAndIT:
      seniorUserRole = userRoleType.managerSystemAndNetwork;
      break;
    case userRoleType.managerTelecomAndTechnology:
      seniorUserRole = userRoleType.managerServerAndIT;
      break;
    case userRoleType.amNetwork:
      seniorUserRole = userRoleType.managerTelecomAndTechnology;
      break;
    case userRoleType.EXECUTIVENetwork:
      seniorUserRole = userRoleType.amNetwork;
      break;
    case userRoleType.EXECUTIVEIT:
      seniorUserRole = userRoleType.EXECUTIVENetwork;
      break;
    case userRoleType.avpDevelopment:
      seniorUserRole = null;
      break;
    case userRoleType.graphicDesigner:
      seniorUserRole = userRoleType.avpDevelopment;
      break;
    case userRoleType.productDevelopmentAndResearch:
      seniorUserRole = userRoleType.graphicDesigner;
      break;
    case userRoleType.sr3dArtist:
      seniorUserRole = userRoleType.productDevelopmentAndResearch;
      break;
    case userRoleType.srVFXArtist:
      seniorUserRole = userRoleType.sr3dArtist;
      break;
    case userRoleType.srVisualize:
      seniorUserRole = userRoleType.srVFXArtist;
      break;
    case userRoleType.avpWebDevelopment:
      seniorUserRole = null;
      break;
    case userRoleType.srManagerDigitalsales:
      seniorUserRole = userRoleType.avpWebDevelopment;
      break;
    case userRoleType.srManagerSEO:
      seniorUserRole = userRoleType.srManagerDigitalsales;
      break;
    case userRoleType.managerSEO:
      seniorUserRole = userRoleType.srManagerSEO;
      break;
    case userRoleType.EXECUTIVESEO:
      seniorUserRole = userRoleType.managerSEO;
      break;
    case userRoleType.contentCreator:
      seniorUserRole = userRoleType.EXECUTIVESEO;
      break;
    case userRoleType.contentWriter:
      seniorUserRole = userRoleType.contentCreator;
      break;
    case userRoleType.frontendDeveloper:
      seniorUserRole = userRoleType.contentWriter;
      break;
    case userRoleType.graphicDesignerWeb:
      seniorUserRole = userRoleType.frontendDeveloper;
      break;
    case userRoleType.jrWebDeveloper:
      seniorUserRole = userRoleType.graphicDesignerWeb;
      break;
    case userRoleType.srWebDeveloper:
      seniorUserRole = userRoleType.jrWebDeveloper;
      break;
    case userRoleType.webDeveloper:
      seniorUserRole = userRoleType.srWebDeveloper;
      break;
    case userRoleType.avpOperations:
      seniorUserRole = null;
      break;
    case userRoleType.vpOperations:
      seniorUserRole = userRoleType.avpOperations;
      break;
    case userRoleType.agmCompliance:
      seniorUserRole = userRoleType.vpOperations;
      break;
    case userRoleType.agmOperations:
      seniorUserRole = userRoleType.agmCompliance;
      break;
    case userRoleType.avpQA:
      seniorUserRole = null;
      break;
    case userRoleType.amQA:
      seniorUserRole = userRoleType.avpQA;
      break;
    case userRoleType.teamLeaderQualityAnalyst:
      seniorUserRole = userRoleType.amQA;
      break;
    case userRoleType.EXECUTIVEQualityAnalyst:
      seniorUserRole = userRoleType.teamLeaderQualityAnalyst;
      break;
    case userRoleType.avpLogistics:
      seniorUserRole = null;
      break;
    case userRoleType.managerLogistics:
      seniorUserRole = userRoleType.avpLogistics;
      break;
    case userRoleType.amLogistics:
      seniorUserRole = userRoleType.managerLogistics;
      break;
    case userRoleType.EXECUTIVELogistics:
      seniorUserRole = userRoleType.amLogistics;
      break;
    case userRoleType.avpMapping:
      seniorUserRole = null;
      break;
    case userRoleType.managerMIS:
      seniorUserRole = userRoleType.avpMapping;
      break;
    case userRoleType.EXECUTIVEMIS:
      seniorUserRole = userRoleType.managerMIS;
      break;
    case userRoleType.avpAdmin:
      seniorUserRole = null;
      break;
    case userRoleType.managerAdmin:
      seniorUserRole = userRoleType.avpAdmin;
      break;
    case userRoleType.srEXECUTIVEAdmin:
      seniorUserRole = userRoleType.managerAdmin;
      break;
    case userRoleType.EXECUTIVEAdmin:
      seniorUserRole = userRoleType.srEXECUTIVEAdmin;
      break;
  }
  return seniorUserRole;
};
