input.addEventListener("keydown", e => {
    if(e.code == "Tab") { //Tab or Shift+Tab
        
        //IE support here
        function nope_not_doing_it() {

        }

        //MOZILLA and others
        if (input.selectionStart || input.selectionStart == '0') {
            let startPos = input.selectionStart;
            let endPos = input.selectionEnd;

            let singplePos = startPos == endPos;

            all_br = [];
            
            for (let i=0; i < input.value.length; i++)
                if (input.value[i] === "\n") all_br.push(i)

            //TAB
            if (!e.shiftKey) {
                if (singplePos) {
                    input.value = input.value.substring(0, startPos) + " ".repeat(4) + input.value.substring(startPos, input.value.length);
                    input.selectionStart = input.selectionEnd = startPos + 4;
                }   
            }
            
            //SHIFT+TAB
            else {
                if (singplePos) {
                    let prev_4 = input.value.substring(startPos-4, startPos);

                    console.log(prev_4)

                    let remove = 0;
                    let stop = false;
                    for (let i=3; !stop && i > -1; i--) {
                        console.log(prev_4[i])
                        if (prev_4[i] == " ")
                            remove++;
                        else stop = true;
                    }
                    
                    input.value = input.value.substring(0, startPos-remove) + input.value.substring(startPos, input.value.length)
                    input.selectionStart = input.selectionEnd = startPos - remove;

                }
            }

            let last_br;
            for (let i=0; i < all_br.length; i++)
                if (startPos < all_br[i])
                    last_br = all_br[i-1];
        }

        code.innerHTML = input.value;
        hljs.highlightBlock(code);

        //Prevent TAB switching to the next element in Mozilla and others
        if(e.preventDefault) {
            e.preventDefault();
        }

        return false; //In IE this should disable TAB switching to the next element
    }
});
