// Function to get a unique identifier for each highlight
function getHighlightId() {
  return `highlight`
}
let cnt = 0


// function to check whether the text is selected or not

function checkSelect(selection){
    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;

    // If the container is a text node, get its parent element
    if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode;
    }

    // Check if the container (or its parent) is a 'span' with class 'hovvv'
    return container.tagName === 'SPAN' && container.classList.contains('highlightedByUs');
}


// Function to highlight selected text and return it
function highlightSelection(arr) {
  console.log('high it')
  const selection = window.getSelection()
  if (!selection.rangeCount) return;
  if(checkSelect(selection))return;
  console.log(selection.toString(),"Selected string")
  const range = selection.getRangeAt(0)
  const span = document.createElement('span')
  span.style.backgroundColor="yellow";
  span.className = 'highlightedByUs'
  const text=selection.toString()
  range.surroundContents(span)
  
  // find the relative elemenet
  findRelativeElement(span, arr)
  console.log(range,"range desu")
  return text;
}
function getSelectionParentElement() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let parent = range.commonAncestorContainer;
        
        // If the selected content is within a text node, get its parent element
        if (parent.nodeType !== 1) {
            parent = parent.parentNode;
        }
        return parent;
    }
    return null;
}

// find the index of the element among it's sibling and return it
function findSiblingIndex(element, parent, arr) {
  const children = parent.children
  console.log("child",children)
  const index = Array.prototype.indexOf.call(children, element)
  return index
}

// find the ancestor of the selected text which has id otherwise body element
// create the arr which will store the position of every parent of the text
function findRelativeElement(element, arr) {
  console.log('findRel', element)
  let relativeElement
  let initElement = element
  let lastElement = element

  while (element.parentNode && !element.parentNode.id && element != document.body) {
    console.log(element,"ele")
    let index = 0
    lastElement = element
    element = element.parentNode
    arr.push(findSiblingIndex(lastElement, element, arr))
  }
  if (element == document.body) {
    console.log('body check', element)
    arr.push(findSiblingIndex(lastElement, element, arr))
    relativeElement = document.body
    app.push(-1)
  }
  if (element.parentNode && element.parentNode.id) {
    console.log('body out', element)
    relativeElement = element.parentNode
    lastElement = element
    element = element.parentNode
    arr.push(findSiblingIndex(lastElement, element, arr))
    arr.push(element.id)
  }
  console.log('body done', element)
  console.log('arr', arr)
}

// Function to save highlights to chrome local storage
async function saveHighlight(id, arr) {
  console.log('saveddd');

  const gg = [...arr.reverse()];
  gg.pop();
  gg.push(id)
  chrome.storage.local.get({ highlights: {} }, async (items) => {
    items.highlights[`${location.href}`] = items.highlights[`${location.href}`] || []
    items.highlights[`${location.href}`].push(gg)
    console.log(items.highlights)
    await chrome.storage.local.set(
      { highlights: items.highlights },

      () => {
        if (chrome.runtime.lastError) {
          console.error(`Error in storage: ${chrome.runtime.lastError}`)
        } else {
          console.log('Highlight saved successfully')
        }
      },
    )
  })
}

// Function to load and reapply highlights from chrome local storage
async function loadHighlights() {
  console.log('KK');
 
  await chrome.storage.local.get({ highlights: {} }, (items) => {
    console.log(items.highlights, 'tet')
    items.highlights[`${location.href}`]?.map((item) => {
      const pageHighlight = item
      console.log('pg', pageHighlight)
      let ele; let i=1;
      

          if(pageHighlight[0]==-1){
            ele = document.body;
            
          }
          else{
            ele = document.getElementById(pageHighlight[0]);
          }
          console.log(ele,"after")
          while(i<pageHighlight.length-2 && ele.childNodes.length){
            if(ele.childNodes[pageHighlight[i]].nodeType===1){

                console.log("pppp",pageHighlight[i],i)
              ele=ele.childNodes[pageHighlight[i]]
              console.log(ele,"while finding childnode")
              i++;
            }
            else{
                console.log("not ele")
            }
      }
     
      const text=pageHighlight[pageHighlight.length-1];
      findAndHighlightText(ele,text);

  })
})
}

// highlight the text after reloading
function findAndHighlightText(element, searchText) {
  

    const index = element.innerHTML?.indexOf(searchText);
    if (index !== -1) {
        element.innerHTML = element.innerHTML.substring(0, index) +
                            "<span class='highlightedByUs' style='background-color:yellow'>" +
                            searchText +
                            "</span>" +
                            element.innerHTML.substring(index + searchText.length);
                            
    }
}

// delete the selection if it is highlighted already
function highlightSelection1() {
    console.log('high it')
    let parent;
    const selection = window.getSelection()
    if (!selection.rangeCount) return
    if(!checkSelect(selection))return;
    const text = selection.toString();
    const canBeParent = selection.getRangeAt(0).commonAncestorContainer;
    console.log("canbe",canBeParent)
    if(canBeParent.nodeType===3){
        parent=canBeParent.parentNode
        console.log("parent",parent);
        console.log("parent parent",parent.parentNode)
        
        removeHighlightedText(text,parent);
    }
    
    
   
  }
async function removeHighlightedText(selectedText,parent){
    let newHighlightArray;
    parent.parentNode.insertBefore(parent.firstChild,parent);
    parent.parentNode.removeChild(parent);
    await chrome.storage.local.get({ highlights: {} }, async (items) => {
        let indexToRemove=-1;
        items.highlights[`${location.href}`]?.map(async (item,index) => {
          const pageHighlight = item
          console.log("removing while checkling",item)
          console.log("llll",pageHighlight[pageHighlight.length-1])
          console.log("text",selectedText)
          if(selectedText===pageHighlight[pageHighlight.length-1]){
                indexToRemove=index;
                console.log(indexToRemove,"index")
                console.log(pageHighlight[pageHighlight.length-1],"L")
          }
        
      })
      if(indexToRemove!=-1){

          items.highlights[`${location.href}`].splice(indexToRemove,1);
          console.log("<<<<first>>>>",items.highlights)
          newHighlightArray = items.highlights[`${location.href}`]
         console.log(newHighlightArray,"OOOO");
         const newHighlight = await chrome.storage.local.get({highlights:{}});
         console.log("jj",newHighlight);
         newHighlight.highlights[`${location.href}`]=newHighlightArray;
         console.log("MMMMMM",newHighlight)
         await chrome.storage.local.set({highlights:newHighlight.highlights})
      }
    });
    
}

// Apply stored highlights when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHighlights)
} else {
  loadHighlights() // DOMContentLoaded has already fired
}

// Listen for the 'H' key to trigger a new highlight
document.addEventListener('keydown', async (event) => {
  console.log('evnt aded')
  if (event.key === 'h' || event.key === 'H') {
    let arr = []
    cnt++
    const id = highlightSelection(arr)
    if (id) {
      await saveHighlight(id, arr)
    }
  }
  if(event.key==='r' || event.key==='R'){
    const remove = highlightSelection1();
  }
})


