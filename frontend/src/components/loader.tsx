import React, { FC } from "react";
interface Props {}
const Loader: FC<Props> = (props: Props) => (
  <div className="row align-middle">
    <i className="fa fa-spinner fa-spin fa-4x m-auto"></i>
  </div>
);

export default Loader;
