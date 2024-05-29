import * as core from "@actions/core";
import * as github from "@actions/github";
import prClosedAction from "./actions/prClosedAction";
import prUpdatedAction from "./actions/prUpdatedAction";

const main = async () => {
  try {
    const bucketName = core.getInput("bucket-prefix");
    const folderToCopy = core.getInput("folder-to-copy");
    const environmentPrefix = core.getInput("environment-prefix");

    console.log(`Bucket Name: ${bucketName}`);
    console.log("---- Printing env variables ----");
    console.log(process.env);
    console.log(JSON.stringify(process.env));

    const githubActionType = github.context.payload.action;

    if (github.context.eventName === "pull_request") {
      switch (githubActionType) {
        case "opened":
        case "reopened":
        case "synchronize":
          await prUpdatedAction(bucketName, folderToCopy, environmentPrefix);
          break;

        case "closed":
          await prClosedAction(bucketName, environmentPrefix);
          break;

        default:
          console.log("PR not created, modified or deleted. Skiping...");
          break;
      }
    } else {
      console.log("Not a PR. Skipping...");
    }
  } catch (error) {
    console.log(error);
    core.setFailed(error);
  }
};

main();
