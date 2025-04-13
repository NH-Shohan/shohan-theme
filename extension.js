const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("Shohan Theme activated!");

  // Register the commands
  let setupAnimationsCommand = vscode.commands.registerCommand(
    "shohanTheme.setupAnimations",
    setupAnimations
  );
  let setupBackgroundCommand = vscode.commands.registerCommand(
    "shohanTheme.setupBackground",
    setupBackground
  );
  let applyRecommendedSettingsCommand = vscode.commands.registerCommand(
    "shohanTheme.applyRecommendedSettings",
    applyRecommendedSettings
  );

  context.subscriptions.push(setupAnimationsCommand);
  context.subscriptions.push(setupBackgroundCommand);
  context.subscriptions.push(applyRecommendedSettingsCommand);

  // Show welcome message on first install
  const extensionId = "NahimHossainShohan.shohantheme";
  const globalState = context.globalState;
  const isFirstInstall = !globalState.get(`${extensionId}.initialized`);

  if (isFirstInstall) {
    showWelcomeMessage();
    globalState.update(`${extensionId}.initialized`, true);
  }
}

function showWelcomeMessage() {
  const message =
    "Thank you for installing Shohan Theme! Would you like to apply the recommended settings?";
  const applyButton = "Apply Recommended Settings";
  const dontShowAgain = "Don't Show Again";

  vscode.window
    .showInformationMessage(message, applyButton, dontShowAgain)
    .then((selection) => {
      if (selection === applyButton) {
        vscode.commands.executeCommand("shohanTheme.applyRecommendedSettings");
      } else if (selection === dontShowAgain) {
        // User chose not to see this message again
      }
    });
}

async function setupAnimations() {
  try {
    // Check if the animations extension is installed
    const animationsExtension = vscode.extensions.getExtension(
      "brandonkirbyson.vscode-animations"
    );

    if (!animationsExtension) {
      const installOption = "Install Extension";
      const response = await vscode.window.showInformationMessage(
        "To enable animations, the VSCode Animations extension needs to be installed.",
        installOption
      );

      if (response === installOption) {
        await vscode.commands.executeCommand(
          "workbench.extensions.installExtension",
          "brandonkirbyson.vscode-animations"
        );
      }
      return;
    }

    // Configure the animations
    await vscode.workspace
      .getConfiguration()
      .update("animations.Enabled", true, vscode.ConfigurationTarget.Global);
    await vscode.workspace
      .getConfiguration()
      .update(
        "animations.CursorAnimation",
        true,
        vscode.ConfigurationTarget.Global
      );
    await vscode.workspace
      .getConfiguration()
      .update(
        "animations.Scrolling",
        "Slide",
        vscode.ConfigurationTarget.Global
      );

    vscode.window.showInformationMessage(
      "Animations have been set up successfully!"
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to set up animations: ${error.message}`
    );
  }
}

async function setupBackground() {
  try {
    // Check if the background extension is installed
    const backgroundExtension = vscode.extensions.getExtension(
      "shalldie.background"
    );

    if (!backgroundExtension) {
      const installOption = "Install Extension";
      const response = await vscode.window.showInformationMessage(
        "To enable background image, the Background extension needs to be installed.",
        installOption
      );

      if (response === installOption) {
        await vscode.commands.executeCommand(
          "workbench.extensions.installExtension",
          "shalldie.background"
        );
      }
      return;
    }

    // Configure the background
    const config = {
      "background.enabled": true,
      "background.editor": {
        useFront: false,
        style: {
          content: "''",
          "pointer-events": "none",
          "z-index": "99999",
          width: "70%",
          height: "75vh",
          left: "15%",
          "background-position": "center",
          "background-size": "cover",
          "background-repeat": "no-repeat",
          opacity: 0.03,
        },
        images: ["https://i.ibb.co/vZhHQ69/phenix.png"],
      },
    };

    for (const [key, value] of Object.entries(config)) {
      await vscode.workspace
        .getConfiguration()
        .update(key, value, vscode.ConfigurationTarget.Global);
    }

    vscode.window.showInformationMessage(
      "Background image has been set up successfully!"
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to set up background image: ${error.message}`
    );
  }
}

async function applyRecommendedSettings() {
  try {
    // Load the recommended settings from the theme-settings.json file
    const extensionPath = vscode.extensions.getExtension(
      "NahimHossainShohan.shohantheme"
    ).extensionPath;
    const settingsPath = path.join(extensionPath, "theme-settings.json");

    if (!fs.existsSync(settingsPath)) {
      vscode.window.showErrorMessage(
        "Could not find recommended settings file."
      );
      return;
    }

    const settingsJson = fs.readFileSync(settingsPath, "utf8");
    const settings = JSON.parse(settingsJson);

    // Apply each setting
    for (const [key, value] of Object.entries(settings)) {
      await vscode.workspace
        .getConfiguration()
        .update(key, value, vscode.ConfigurationTarget.Global);
    }

    // Set up animations and background
    await setupAnimations();
    await setupBackground();

    vscode.window.showInformationMessage(
      "Recommended settings have been applied successfully!"
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to apply recommended settings: ${error.message}`
    );
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
