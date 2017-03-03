
var mongoose = require("mongoose"),
 	Campaign = mongoose.model('Campaign'),
    sunlight = require("sunlight-congress-api");

var campaignController = {};

// Find campaign by ID: uses shortid to find a specific campaign
campaignController.findCampaignById = function (shortid) {
    var findStr = {_id: shortid};
    campaign = Campaign.find(findStr);
    return campaign;
}

// Find campaign by title and user
campaignController.findCampaignByTitleAndUser = function (title, userid) {
    var findStr = {title: title, influencer: userid};
    campaign = Campaign.find(findStr);
    return campaign;
}

// Finds all campaigns for a user
campaignController.findCampaignsByUser = function (userid) {
    var findStr = {influencer: userid};
    campaigns = Campaign.find(findStr);
    return campaigns;
}

// not used for now, but we probably want to create a page for this
campaignController.findAllCampaigns = function (request, response) {
    if (request.user) {
        campaigns = Campaign.find({});
        campaigns.then(function(result) {
            response.send(result);
        })
    } else {
        response.status(301).send({});
    }
};

campaignController.saveCampaign = function (request) {
    var findStr = {_id: request.body.shortid, influencer: request.user.id};
    findCamp = Campaign.find(findStr).exec()
        .then(function(result) {
            if(result.length > 0) {
                console.log("Updating")
                promise = Campaign.update(findStr,{title: request.body.title,
                    script: request.body.script,
                    thank_you: request.body.thank_you,
                    learn_more: request.body.learn_more,
                    publish: request.body.publish,
                    influencer: request.user.id });
            } else {
                console.log("Creating new")
                campaign = new Campaign({title: request.body.title,
                    script: request.body.script,
                    thank_you: request.body.thank_you,
                    learn_more: request.body.learn_more,
                    publish: request.body.publish,
                    influencer: request.user.id });
                promise = campaign.save();
            }

            return promise;
        });

    return findCamp;
}

campaignController.deleteCampaign = function (shortid, userid) {
    var findStr = {_id: shortid, influencer: userid};
    campaign = Campaign.find(findStr).remove().exec();
    return campaign;
}

campaignController.findLegislator = function (latitude, longitude, response) {

    var getRepresentative = function(legislators) {
        if (legislators.length == 0) {
            return null;
        }

        for (var legislatorIndex = 0; legislatorIndex < legislators.length; legislatorIndex++) {
          var legislator = legislators[legislatorIndex];
          if (legislator.title == "Rep") {
            return legislator;
          }
        }
        var firstLegislator = legislators[0];
        return firstLegislator;
    }

    var success = function(data) {
      var legislators = data.results;
      var representative = getRepresentative(legislators);
      var representativeFound = (representative != null);

      responseObject = {representativeFound: representativeFound,
                        representativeInfo: representative};

      response.send(JSON.stringify(responseObject));
    }

    sunlight.init("");
    sunlight.legislatorsLocate().filter("latitude", latitude)
        .filter("longitude", longitude).call(success);
}

module.exports = campaignController;