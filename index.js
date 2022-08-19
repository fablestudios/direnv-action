const core = require("@actions/core");
const cp = require("child_process");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const direnv = "asdf exec direnv";

    exec(`${direnv} allow`);
    const envs = JSON.parse(exec(`${direnv} export json`));

    Object.keys(envs).forEach(function (name) {
      const value = envs[name];
      core.exportVariable(name, value);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

function exec(command) {
  core.info(command);
  return cp.execSync(command, { encoding: "utf-8" });
}

run();
