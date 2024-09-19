import { ReactNode } from "react";
import styles from "./styles.module.css";

function Layout({ children }: { children: ReactNode }) {
  return <div className={styles.gameLayout}>{children}</div>;
}

export default Layout;
