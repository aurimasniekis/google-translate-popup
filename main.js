const {menubar} = require('menubar');
const {globalShortcut, app, Menu, Tray, clipboard} = require('electron');

const A_TO_B = 1;
const B_TO_A = 0;

let modifier = 'alt';
let langModifier = 'ctrl';
if (process.platform === "darwin") {
    modifier = 'cmd';
    langModifier = 'meta';
}

const options = {
    aLang: 'en',
    bLang: 'ja',
    defaultState: B_TO_A,
    openAtoB: `ctrl+${modifier}+y`,
    openBtoA: `ctrl+${modifier}+t`,
    openAndPasteAtoB: `ctrl+shift+${modifier}+y`,
    openAndPasteBtoA: `ctrl+shift+${modifier}+t`,
    width: 1200,
    height: 600,
    resetAfter: 60 * 3,
};


const DEFAULT_STATE = options.defaultState;
const urls = {
    [A_TO_B]: `https://translate.google.com/#view=home&op=translate&sl=${options.aLang}&tl=${options.bLang}`,
    [B_TO_A]: `https://translate.google.com/#view=home&op=translate&sl=${options.bLang}&tl=${options.aLang}`,
};
let langState = DEFAULT_STATE;

app.on('ready', () => {
    let mb;
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show', click: () => {
                mb.window.show();
            }
        },
        {type: 'separator'},
        {label: 'Quit', role: 'quit'},
    ]);

    mb = menubar(
        {
            preloadWindow: true,
            windowPosition: "center",
            browserWindow: {
                width: options.width,
                height: options.height
            },
            index: false,
        }
    );

    mb.on('ready', () => {
        mb.tray.setContextMenu(contextMenu);
    });

    const setLang = (lang) => {
        if (lang !== langState) {
            switch (lang) {
                case A_TO_B:
                    langState = A_TO_B;
                    break;

                case B_TO_A:
                    langState = B_TO_A;
                    break;
            }

            mb.window.webContents.sendInputEvent({type: "keyDown", keyCode: 's', modifiers: [langModifier, "shift"]});
            mb.window.webContents.sendInputEvent({type: "char", keyCode: 's', modifiers: [langModifier, "shift"]});
            mb.window.webContents.sendInputEvent({type: "keyUp", keyCode: 's', modifiers: [langModifier, "shift"]});
        }
    };

    mb.on('after-create-window', function () {
        globalShortcut.register(options.openBtoA, function () {
            setLang(B_TO_A);

            mb.window.show()
        });

        globalShortcut.register(options.openAtoB, function () {
            setLang(A_TO_B);

            mb.window.show()
        });

        globalShortcut.register(options.openAndPasteBtoA, function () {
            setLang(B_TO_A);

            const text = clipboard.readText().replace(/"/g, "\\\\");

            mb.window.webContents.executeJavaScript(`document.querySelector("#source").value = "${text}"`);

            mb.window.show()
        });

        globalShortcut.register(options.openAndPasteAtoB, function () {
            setLang(A_TO_B);

            const text = clipboard.readText().replace(/"/g, "\\\\");

            mb.window.webContents.executeJavaScript(`document.querySelector("#source").value = "${text}"`);

            mb.window.show()
        });

        mb.window.webContents.on('dom-ready', function () {
            const cont = mb.window.webContents;

            cont.executeJavaScript('document.querySelector("#gb > div.gb_Wd.gb_4d").remove()');
            cont.executeJavaScript('document.querySelector("body > div.frame > div.page.tlid-homepage.homepage.translate-text > div.input-button-container").remove()');
            cont.executeJavaScript('document.querySelector("body > div.frame > div.page.tlid-homepage.homepage.translate-text > div.gp-footer").remove()');
            cont.executeJavaScript('document.querySelector("#gb > div.gb_Nd.gb_4d.gb_Vd.gb_Ud > div.gb_Tc.gb_Ua.gb_Sc").remove()');
            cont.executeJavaScript('document.querySelector("body > div.frame > div.page.tlid-homepage.homepage.translate-text > div.homepage-content-wrap > div.feedback-link").remove();');
        });

        mb.window.webContents.on('before-input-event', (event, input) => {
            if (!input.control && !input.alt && input.meta && input.key === 'Enter') {
                mb.window.webContents.executeJavaScript("document.getElementsByClassName('tlid-translation translation').item(0).textContent").then((text) => {
                    clipboard.writeText(text);

                    mb.hideWindow();
                    if (process.platform === "darwin") {
                        app.hide();
                    }
                });
            }
            if (!input.meta && !input.control && input.alt && input.key === 'Enter') {
                mb.window.webContents.executeJavaScript("document.getElementsByClassName('tlid-transliteration-content transliteration-content full').item(1).textContent\n").then((text) => {
                    clipboard.writeText(text);

                    mb.hideWindow();
                    if (process.platform === "darwin") {
                        app.hide();
                    }
                });
            }

            if (!input.meta && !input.control && !input.alt && input.key === 'Escape') {
                mb.hideWindow();
                if (process.platform === "darwin") {
                    app.hide();
                }
            }
        });

        langState = DEFAULT_STATE;
        mb.window.loadURL(urls[langState]);
    });

    let focusLostTimeout;

    mb.on('after-hide', () => {
        clearTimeout(focusLostTimeout);
        focusLostTimeout = setTimeout(() => {
            langState = DEFAULT_STATE;
            mb.window.loadURL(urls[langState]);
        }, 1000 * options.resetAfter);
    });

});
