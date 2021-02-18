import React, { useEffect } from "react";



interface Props {}
export const CollectionForm: React.FC<Props> = (props:Props) => {

return <form>
    collection name <input type='text' id='collectionName'/>
    <button>create</button>
    </form>;
};