#!/bin/sh
# Author: Gustavo Ilha Morais
# E-mail: gustavoilhamorais@gmail.com

# Default VARs
VIEWS_PATH="$HOME/Library/Scripts/front-end/src/views"
VIEW_NAME=NULL
VIEW_ROUTE=NULL

# Helpers
source_files_contents() {
   for f in ./scripts/automations/snippets/*.sh; 
   do 
      source "$f";
   done
}
showHelp() {
   # Display Help
   echo "Start a new MeuML.com's view:"
   echo
   echo "Syntax: newview [-h|r|c|s] <name> <route>"
   echo "options:"
   echo "h     Print this Help."
   echo "c     Create a view with contextAPI state mgmt."
   echo "e     Create a view without any state mgmt."
   echo
}

# File & DIR mgmt
createViewDIR() {
   VIEW=$VIEWS_PATH/$VIEW_NAME
   mkdir $VIEW
}
createViewIndexFile() {
   INDEX=$VIEWS_PATH/$VIEW_NAME/index.js
   touch $INDEX
}
createComponentsDIR() {
   COMPONENTS=$VIEW/components
   mkdir $COMPONENTS
}
createMainComponentFile() {
   MAIN=$VIEW/components/Main.js
   touch $MAIN
}
createRequestsFile() {
   REQUESTS=$VIEW/requests.js
   touch $REQUESTS
}
createHooksDIR() {
   HOOKS=$VIEW/hooks
   mkdir $HOOKS
}
createTestsDIR() {
   TESTS=$VIEW/tests
   mkdir $TESTS
   touch $TESTS/render.test.js
   echo $RENDER_TEST >> $TESTS/render.test.js
}
createView() {
   if [ -z "$VIEW_NAME" ]; then
      echo "Error: you must inform a valid name. Checkout syntax with -h option."
   elif [ -z "$VIEW_ROUTE" ]; then
      echo "Error: you must inform a valid route path. Checkout syntax with -h option."
   else
      createViewDIR
      createViewIndexFile
      createComponentsDIR
      createMainComponentFile
      createRequestsFile
      createHooksDIR
      createTestsDIR
   fi
}
createContext() {
   CONTEXT="$VIEW/${VIEW_NAME}.context.js"
   touch $CONTEXT
   echo $CONTEXT_CONTENT >> $CONTEXT
}

# Script options
useContext() {
   source_files_contents
   createView
   createContext
   echo -e $INDEX_CONTEXT_CONTENT >> $INDEX
   echo -e $MAIN_CONTEXT_CONTENT >> $MAIN
}
useEmpty() {
   source_files_contents
   createView
   echo $INDEX_CONTENT >> $INDEX
   echo $MAIN_CONTENT >> $MAIN
}

# Get the options
while getopts ":hceh:" option; do
   VIEW_NAME=$2
   VIEW_ROUTE=$3
   case $option in
      h) # display Help
         showHelp
         exit;;
      c) # contextAPI
         useContext
         exit;;
      e) # stateless
         useEmpty
         exit;;
      \?) # Invalid option
         echo "Error: Invalid option"
         exit;;
   esac
done
