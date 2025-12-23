//@ts-nocheck
(function () {
    const vscode = acquireVsCodeApi();
    // initialize state
    const oldState = vscode.getState();

    let messages = oldState.messages || [];
    let activeFiles = oldState.activeFiles || []; // array of file paths (strings)
    let currentFile = null; // current file path (string)
    let isCurrentFileIncluded = true;
    let loadingMessageElement = null;

    // request current file state from backend
    vscode.postMessage({
        type: "requestCurrentFile"
    });

    const chatInput = document.querySelector("#chat-input");
    const inputWrapper = document.querySelector(".input-wrapper");

    document.querySelector("#send-button").addEventListener("click", () => {
        sendUserMessage();
    });
    // send message also by pressing enter
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendUserMessage();
        }
        adjustTextareaHeight();
    });

    chatInput.addEventListener("focus", () => {
        inputWrapper.classList.add("focused");
    });
    chatInput.addEventListener("blur", () => {
        inputWrapper.classList.remove("focused");
    });

    // add event listener to adjust height when typing
    chatInput.addEventListener("input", adjustTextareaHeight);

    /**
     * Adjusts the height of the textarea to fit its content
     */
    function adjustTextareaHeight() {
        const textarea = document.querySelector("#chat-input");
        // reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // set the height to match the content 
        const newHeight = Math.max(36, Math.min(textarea.scrollHeight, window.innerHeight * 0.7));
        textarea.style.height = newHeight + 'px';
    }

    adjustTextareaHeight(); // set initial height correctly

    document.querySelector("#add-file-button").addEventListener("click", () => {
        requestFileSelection();
    });
    chatInput.focus();

    document.querySelector("#toggle-grounding-button").addEventListener("click", () => {
        toggleGrounding();
    });

    // handle messages recieved from the backend
    window.addEventListener("message", (event) => {
        const message = event.data; // json data recieved
        switch (message.type) {
            case "assistantMessage": {
                removeLoadingIndicator();
                addMessageToChat(message.message, false);
                break;
            }
            case "addFile": {
                addFileToContext(message.filePath);
                break;
            }
            case "clearChat": {
                clearChat();
                break;
            }
            case "updateCurrentFile": {
                updateCurrentFile(message.filePath);
                break;
            }
            case "updateGroundingState": {
                updateGroundingUI(message.isEnabled);
                break;
            }
        }
    });

    function clearChat() {
        messages = [];
        activeFiles = [];

        document.querySelector("#chat-messages").innerHTML = "";
        updateActiveFilesUI();

        updateState();
    }

    /**
     * Updates the VS Code webview state via setState
     */
    function updateState() {
        vscode.setState({
            messages,
            activeFiles
        });
    }

    /**
     * Sends a user message to the backend
     */
    function sendUserMessage() {
        const chatInput = document.querySelector("#chat-input");
        const text = chatInput.value.trim();

        if (text) {
            // immediately display the user's message
            addMessageToChat(text, true);

            // show loading indicator while waiting for response
            addLoadingIndicator("Thinking...");

            // build context files array
            const contextFiles = [...activeFiles];
            if (isCurrentFileIncluded && currentFile) {
                contextFiles.push(currentFile);
            }

            // send to backend for processing with all context
            vscode.postMessage({
                type: "userMessage",
                message: text,
                conversationHistory: messages,
                contextFiles: contextFiles
            });
            // clear input and reset height
            chatInput.value = "";
            adjustTextareaHeight();
        }
    }

    /** Send a request to open the file picker */
    function requestFileSelection() {
        vscode.postMessage({
            type: "requestFileSelection"
        });
    }

    /**
     * Add a file to the context and update the UI
     * @param {string} filePath - the file path to add
     */
    function addFileToContext(filePath) {
        // check if file is already in context
        if (!activeFiles.includes(filePath)) {
            activeFiles.push(filePath);
            updateActiveFilesUI();
            updateState();
        }
    }

    /**
     * Remove a file from the context
     * @param {string} filePath path of file to remove
     */
    function removeFileFromContext(filePath) {
        activeFiles = activeFiles.filter(path => path !== filePath);
        updateActiveFilesUI();
        updateState();
    }

    /** updates the active files UI */
    function updateActiveFilesUI() {
        const filesContainer = document.querySelector("#active-files-container");
        filesContainer.innerHTML = "";

        if (activeFiles.length === 0) {
            filesContainer.style.display = "none";
            return;
        }

        filesContainer.style.display = "flex";

        // add a chip for each active file
        activeFiles.forEach(filePath => {
            const fileName = filePath.split('/').pop();

            const fileChip = document.createElement("div");
            fileChip.className = "file-chip";

            const fileNameSpan = document.createElement("span");
            fileNameSpan.className = "file-name";
            fileNameSpan.title = filePath;
            fileNameSpan.textContent = fileName;

            const removeButton = document.createElement("button");
            removeButton.className = "remove-file";
            removeButton.innerHTML = '<i class="icon-cancel-circled"></i>'; // using fontello cancel icon
            removeButton.title = "Remove file from context";
            removeButton.addEventListener("click", () => {
                removeFileFromContext(filePath);
            });

            fileChip.appendChild(fileNameSpan);
            fileChip.appendChild(removeButton);
            filesContainer.appendChild(fileChip);
        });
    }


    function addLoadingIndicator(text) {
        removeLoadingIndicator();

        // create a new loading indicator
        const messagesContainer = document.querySelector("#chat-messages");
        loadingMessageElement = document.createElement("div");
        loadingMessageElement.className = "message message-assistant loading";
        loadingMessageElement.textContent = text;
        messagesContainer.appendChild(loadingMessageElement);

        // scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeLoadingIndicator() {
        if (loadingMessageElement) {
            loadingMessageElement.remove();
            loadingMessageElement = null;
        }
    }

    /**
     * Add a message to the chat UI
     * @param {string} text the message text
     * @param {boolean} isUser whether this is a user message or not
     */
    function addMessageToChat(text, isUser) {
        messages.push({ 
            role: isUser ? "user" : "assistant", 
            content: text 
        });

        const messagesContainer = document.querySelector("#chat-messages");
        const messageElement = document.createElement("div");
        messageElement.className = isUser ? "message message-user" : "message message-assistant";

        if (isUser) {
            messageElement.textContent = text;
        } else {
            messageElement.innerHTML = marked.parse(text);
            highlightCodeBlocks(messageElement);
        }

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        updateState();
    }

    /**
     * Use Highlight.js to apply syntax highlighting to code blocks
     * @param {HTMLElement} element the element containing markdown-rendered content
     */
    function highlightCodeBlocks(element) {
        // find all pre code elements
        const codeBlocks = element.querySelectorAll('pre code');

        // add a class for styling and a copy button for each code block
        codeBlocks.forEach(block => {
            const pre = block.parentElement;
            if (pre) {
                // add styling class
                pre.classList.add('code-block');

                // create wrapper div for the code block and copy button
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                // extract language from class if it exists (format: language-xxx)
                let language = '';
                const classes = block.className.split(' ');
                for (const cls of classes) {
                    if (cls.startsWith('language-')) {
                        language = cls.substring(9); // remove 'language-' prefix
                        break;
                    }
                }

                // create language label if a language was detected
                if (language) {
                    const languageLabel = document.createElement('div');
                    languageLabel.className = 'language-label';
                    languageLabel.textContent = language;
                    wrapper.appendChild(languageLabel);
                }

                // create copy button with icon
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.innerHTML = '<i class="icon-clipboard"></i>'; // using fontello clipboard icons
                copyButton.title = 'Copy code to clipboard';

                // add click event listener to copy button
                copyButton.addEventListener('click', () => {
                    const codeText = block.textContent;
                    navigator.clipboard.writeText(codeText)
                        .then(() => {
                            // visual feedback on successful copy
                            copyButton.innerHTML = '<i class="icon-check"></i>';
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="icon-clipboard"></i>';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy code: ', err);
                            copyButton.innerHTML = '<i class="icon-cancel-circle"></i>';
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="icon-clipboard"></i>';
                            }, 2000);
                        });
                });

                // apply Highlight.js to the code block
                hljs.highlightElement(block);

                // move the pre element to the wrapper
                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);

                // add the copy button to the wrapper
                wrapper.appendChild(copyButton);
            }
        });
    }


    function toggleGrounding() {
        vscode.postMessage({
            type: "toggleGrounding"
        });
    }

    /**
     * Updates the grounding button to reflect the current grounding state
     * @param {boolean} isEnabled - whether grounding is enabled
     */
    function updateGroundingUI(isEnabled) {
        const toggleButton = document.querySelector("#toggle-grounding-button");

        // update class based on the state
        if (isEnabled) {
            toggleButton.classList.add("active");
        } else {
            toggleButton.classList.remove("active");
        }

        // update the tooltip
        toggleButton.title = isEnabled ?
            "Disable search grounding" :
            "Enable search grounding";
    }

    /**
     * updates the current file in the UI
     * @param {string|null} filePath - the current open file path or null if no file is open
     */
    function updateCurrentFile(filePath) {
        currentFile = filePath;

        const currentFileContainer = document.querySelector("#current-file-container");
        currentFileContainer.innerHTML = "";

        if (!filePath) {
            currentFileContainer.classList.add("hidden");
            return;
        }

        currentFileContainer.classList.remove("hidden");

        const fileDisplay = document.createElement("div");
        fileDisplay.className = "current-file";

        const fileLabel = document.createElement("span");
        fileLabel.className = "current-file-label";
        fileLabel.textContent = "Current File:";

        const fileName = filePath.split('/').pop();
        const fileNameSpan = document.createElement("span");
        fileNameSpan.className = "file-name";
        fileNameSpan.title = filePath;
        fileNameSpan.textContent = fileName;

        const toggleButton = document.createElement("button");
        toggleButton.className = "toggle-file" + (isCurrentFileIncluded ? " active" : "");
        toggleButton.innerHTML = isCurrentFileIncluded ? '<i class="icon-eye"></i>' : '<i class="icon-eye-off"></i>';
        toggleButton.title = isCurrentFileIncluded ? "Exclude from context" : "Include in context";
        toggleButton.addEventListener("click", toggleCurrentFile);

        fileDisplay.appendChild(fileLabel);
        fileDisplay.appendChild(fileNameSpan);
        fileDisplay.appendChild(toggleButton);
        currentFileContainer.appendChild(fileDisplay);
    }

    /**
     * toggles whether the current file is included in the chat context
     */
    function toggleCurrentFile() {
        if (!currentFile) {
            return;
        }

        isCurrentFileIncluded = !isCurrentFileIncluded;

        const toggleButton = document.querySelector(".toggle-file");
        if (toggleButton) {
            toggleButton.className = "toggle-file" + (isCurrentFileIncluded ? " active" : "");
            toggleButton.innerHTML = isCurrentFileIncluded ? '<i class="icon-eye"></i>' : '<i class="icon-eye-off"></i>';
            toggleButton.title = isCurrentFileIncluded ? "Exclude from context" : "Include in context";
        }
    }

    function showPreviousMessages() {
        messages.forEach((msg) => {
            const messageElement = document.createElement("div");
            messageElement.className = msg.role === "user"
                ? "message message-user"
                : "message message-assistant";

            if (msg.role === "user") {
                messageElement.textContent = msg.content;
            } else {
                // render assistant messages as markdown
                messageElement.innerHTML = marked.parse(msg.content);
                highlightCodeBlocks(messageElement);
            }

            messagesContainer.appendChild(messageElement);
        });
    }

    // UI initialization
    const messagesContainer = document.querySelector("#chat-messages");
    // if there are previous messages, show them
    if (messages.length > 0) {
        showPreviousMessages();
    }
    // initialize active files UI
    updateActiveFilesUI();
    // scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
})();
