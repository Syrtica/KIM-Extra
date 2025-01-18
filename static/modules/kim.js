import { Hex } from "./hex.js";
import Conversation from "./nodes.js";

//################//
let chatTarget;
//################//

function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateStatus(text) {
    $messageStatus.textContent = text;
}

async function sendKIM(sender, message, wordcount, gold /*(unused)*/) {
    const senderEl = document.createElement('span');
    if (!sender) {
        sender = chatTarget.toString();
        if (wordcount && $delay.checked) {
            updateStatus(`${sender} is typing...`);
            await pause($messageWindow.children.length ? chatTarget.getTypingDelay(wordcount) : 300);
        }
    }
    else
        senderEl.classList.add(sender.name.toLowerCase());
    senderEl.textContent = sender;

    const contentEl = document.createElement('p');
    if (gold) contentEl.classList.add("gold");
    contentEl.textContent = message;

    const div = document.createElement('div');
    div.append(senderEl, contentEl);

    $messageWindow.appendChild(div);
    div.scrollIntoView({ block: "nearest", inline: "nearest" });

    updateStatus('');
    if (wordcount && $delay.checked)
        await pause(300);
}

let optionNodes = [];
export async function chooseOption(idx) {
    let message = optionNodes[idx];
    $optionButtons.forEach((button) => {
        button.textContent = '';
        button.disabled = true;
    });
    await sendKIM(Drifter, message.text);
    if (message.next) {
        await runNode(message.next);
    }
    else {
        throw new Error("Choosing an option has to go somewhere!");
    }
}

export function startConversation() {
    if ($chatwith.selectedIndex === 0 || $chattopic.selectedIndex === 0) return;
    chatTarget = Hex.get($chatwith.options[$chatwith.selectedIndex].textContent);

    $chattitle.textContent = chatTarget.toString();
    $messageWindow.replaceChildren();

    const opt = $chattopic.options[$chattopic.selectedIndex];
    getSrc(opt.dataset.whose, opt.textContent);
}

async function getSrc(target, topic) {
    const response = await fetch(`/static/chats/${target}/${topic}.txt`, { cache: "no-store" });
    const data = await response.text();
    lockConfig();
    chatTarget = Hex.get(target);
    Conversation.load(data);
    updateStatus('');
    await runNode(1);
}

async function runNode(currentNode) {
    while (typeof currentNode === "object")
        currentNode = currentNode.next;

    if (!currentNode) return;
    if (currentNode === "END") {
        await sendKIM(System, "Chat has ended.");
        updateStatus(`${chatTarget} is offline.`);
        unlockConfig();
        return Promise.resolve();
    }

    let runningNode = Conversation.nodes[currentNode];
    if (runningNode.assigns.size) {
        for (let kv of runningNode.assigns) {
            GlobalFlags.set(kv[0], kv[1]);
            await sendKIM(System, `${kv[0]} is now ${kv[1]}.`);
        }
    }

    for (const message of runningNode.messages) {
        if (message.enabled()) {
            await sendKIM(null, message.text, message.wordcount);
            if (message.next) {
                await runNode(message.next);
                return Promise.resolve();
            }
        }
    }

    optionNodes = [];
    runningNode.options.forEach((option) => {
        if (!option.enabled()) return;
        optionNodes.push(option);
    });
    optionNodes.forEach((option, idx) => {
        $optionButtons[idx].disabled = false;
        $optionButtons[idx].textContent = option.text;
    });

    if (!optionNodes.length)
        throw new Error(`No endpoint following node ${currentNode}`);
}