const Icono = ({ trazo }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d={trazo} /></svg>
)
export const Mas = () => <Icono trazo="M12 5v14M5 12h14" />
export const Menos = () => <Icono trazo="M5 12h14" />
