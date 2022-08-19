const core = require("@actions/core");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const install = path.join(__dirname, "install-direnv.sh");

    let direnv = "direnv";
    let available = false;
    const asdf = findAsdf();

    if (hasCommand("direnv")) {
      core.info("direnv is already installed");
      available = true;
    } else if (asdf && hasAsdfDirenv(asdf)) {
      core.info("direnv is already installed (via asdf)");
      direnv = `${asdf} exec direnv`;
      available = true;
    }

    if (!available) {
      core.info("direnv not found; installing now");
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
  core.info(
    `${command} is ${
      status === 0
        ? "installed"
        : `not available on $PATH (${process.env.PATH})`
    }`
  );
  return status === 0;
}

function findAsdf() {
  if (hasCommand("asdf")) return "asdf";

  const localAsdf = path.join(process.env.HOME, ".asdf", "bin", "asdf");
  if (fs.existsSync(localAsdf)) return localAsdf;
}

function hasAsdfDirenv(asdf) {
  const { status } = cp.spawnSync(`${asdf} where direnv`, {
    stdio: ["ignore", "inherit", "inherit"],
  });
  return status === 0;
}

run();
