const core = require("@actions/core");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const install = path.join(__dirname, "install-direnv.sh");
    let direnv = "direnv";

    if (hasCommand("direnv")) {
      core.info("direnv is already installed");
    } else if (hasAsdfDirenv()) {
      core.info("direnv is already installed (via asdf)");
      direnv = `${findAsdf()} exec direnv`;
    } else {
      core.info("asdf not found; installing now");
      cp.execSync(`bash ${install}`, {
        encoding: "utf-8",
      });
    }

    cp.execSync(`${direnv} allow`, { encoding: "utf-8" });
    const envs = JSON.parse(
      cp.execSync(`${direnv} export json`, { encoding: "utf-8" })
    );

    Object.keys(envs).forEach(function (name) {
      const value = envs[name];
      core.exportVariable(name, value);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

function hasCommand(command) {
  const { status } = cp.spawnSync(`command -v ${command}`);
  return status === 0;
}

function findAsdf() {
  if (hasCommand("asdf")) return "asdf";

  const localAsdf = path.join(process.env.HOME, ".asdf", "bin", "asdf");
  if (fs.existsSync(localAsdf)) return localAsdf;
}

function hasAsdfDirenv() {
  const asdf = findAsdf();
  if (!asdf) return false;

  const { status } = cp.spawnSync(`${asdf} where direnv`);
  return status === 0;
}

run();
