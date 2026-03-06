INDEX_CONTEXT_CONTENT="import React from 'react';\n
import Main from './components/Main';\n
import { Provider } from './$VIEW_NAME.context';\n
\n
const $VIEW_NAME = () => (\n
   <Provider>\n
      <Main />\n
   </Provider>\n
)\n
\n
export default $VIEW_NAME;"