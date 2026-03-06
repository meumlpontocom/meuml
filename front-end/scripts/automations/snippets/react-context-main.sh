MAIN_CONTEXT_CONTENT="import React, { useContext } from 'react';\n
import PageHeader from 'src/components/PageHeader';\n
import ${VIEW_NAME}Context from '../$VIEW_NAME.context';\n
\n
const Main = () => {\n
   const context = useContext(${VIEW_NAME}Context);\n
   return (\n
      <PageHeader \n
         heading={context.viewName}\n
         subheading='TESTING'\n
      />\n
   );\n
}\n
\n
export default Main;"