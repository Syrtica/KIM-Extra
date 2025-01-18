import { Typist, Drifter, Hex } from "./hex.js";
import { startConversation, chooseOption } from "./kim.js";

new Hex("Aoi", "xX GLIMMER Xx", 55);
new Hex("Amir", "H16h V0l7463", 1000);
new Hex("Arthur", "Broadsword", 40);
new Hex("Eleanor", "Salem", 80);
new Hex("Lettie", "Belladona ~{@", 55);
new Hex("Quincy", "Soldja1Shot1kil", 60);

window.GlobalFlags = new Map();
window.System = new Typist("System");
window.Config = {
    //
}

DOMContentLoaded.then(() => {
    document.getElementById("start").addEventListener("click", startConversation);
    window.Drifter = new Drifter(document.getElementById("username"));
});

window.onload = () => {
    //####################################################

    window.$username = document.getElementById("username");
    window.$dating = document.getElementById("dating");
    window.$chatwith = document.getElementById("chatwith");
    window.$chattopic = document.getElementById("topic");

    window.$chattitle = document.getElementById("chattitle");
    window.$messageWindow = document.getElementById("chatlog");
    window.$messageStatus = document.getElementById("status");
    window.$optionButtons = [...document.getElementById("options").children];
    window.$flags = [...document.querySelectorAll("[name=flags]")];

    window.$delay = document.getElementById("delay");
    window.$system = document.getElementById("system");

    $optionButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => chooseOption(idx));
    });

    //####################################################

    function updateMessagesScrollPosition() {
        let msg = $messageWindow.querySelector("&> :last-child");
        if (msg) msg.scrollIntoView({ block: "end", inline: "nearest" });
    }

    window.addEventListener('resize', function () {
        updateMessagesScrollPosition();
    });






    window.lockConfig = function () {
        $username.readOnly = true;
        $dating.disabled = true;
        $chatwith.disabled = true;
        $chattopic.disabled = true;
        $flags.forEach((cb) => cb.disabled = true);
    };

    window.unlockConfig = function () {
        $username.readOnly = false;
        $dating.disabled = false;
        $chatwith.disabled = false;
        $chattopic.disabled = false;
        $flags.forEach((cb) => cb.disabled = false);
    };

    {
        $flags.forEach((flag) => {
            var lsv = localStorage.getItem(flag.value);
            flag.checked = lsv === "true";
            flag.addEventListener('change', function () {
                localStorage.setItem(this.value, this.checked);
            });
        });
    }

    {
        var lsv = localStorage.getItem("username");
        if (lsv)
            $username.value = lsv;
        $username.addEventListener('change', () => {
            localStorage.setItem("username", $username.value);
        });
    }

    {
        var lsv = localStorage.getItem("dating");
        updateDatingFlags(lsv);
        $dating.addEventListener('change', () => {
            localStorage.setItem("dating", $dating.selectedIndex);
            updateDatingFlags($dating.selectedIndex);
        });

        function updateDatingFlags(value) {
            GlobalFlags.set("&IsDating", !!value);
            [...$dating.options].forEach((opt, idx) => {
                if (!idx) return;
                if (idx == value) {
                    opt.selected = true;
                    GlobalFlags.set(`&${opt.textContent}Dating`, true);
                }
                else {
                    GlobalFlags.set(`&${opt.textContent}Dating`, false);
                }
            });
        }
    }

    {
        var lsv = parseInt(localStorage.getItem("chatwith"));

        if (!isNaN(lsv))
            $chatwith.options[lsv].selected = true;

        $chatwith.addEventListener('change', updateChatTarget);
        updateChatTarget();

        function updateChatTarget() {
            let name = $chatwith.options[$chatwith.selectedIndex].textContent;
            [...$chattopic.options].slice(1).forEach((opt) => opt.disabled = opt.dataset.whose !== name);
            localStorage.setItem("chatwith", $chatwith.selectedIndex);
        }
    }

    {
        var lsv = parseInt(localStorage.getItem("chattopic"));

        if (!isNaN(lsv))
            $chattopic.options[lsv].selected = true;

        $chattopic.addEventListener('change', () => localStorage.setItem("chattopic", $chattopic.selectedIndex));
    }

    {
        var lsv = localStorage.getItem("system");
        $system.checked = lsv === "true";
        updateSystemMessageVisibility();

        $system.addEventListener('change', () => {
            localStorage.setItem("system", !!$system.checked);
            updateSystemMessageVisibility();
        });

        function updateSystemMessageVisibility() {
            if ($system.checked)
                $messageWindow.classList.remove("hide-system");
            else
                $messageWindow.classList.add("hide-system");
        }
    }

    {
        var lsv = localStorage.getItem("delay");
        $delay.checked = lsv === "true";
        $delay.addEventListener('change', () => {
            localStorage.setItem("delay", !!$delay.checked);
        });
    }
};