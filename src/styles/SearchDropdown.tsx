const dropdown = {
  backgroundColor: "var(--color-secondary)",
  color: "var(--color-text)",
  height: "2.3rem",
  paddingLeft: "0.8rem",
  "&:hover": {
    backgroundColor: "color-mix(in srgb, var(--color-secondary) 90%, white);",
  },
  border: "0.5px solid black",
  "&:active": {
    backgroundColor: "color-mix(in srgb, var(--color-secondary) 70%, white);",
  },
  "& .MuiTypography-root": {
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: "-0.03em",
    fontWeight: "500",
    textShadow: "0 0 0.3px currentColor",
  },
};

const dropdownIcon = (isOpen: boolean) => ({
  width: "0.7rem",
  fontSize: "1rem",
  paddingRight: "0.5rem",
  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
  transformOrigin: "25% 50%",
  transition: "transform ease 0.2s",
});

const searchFieldBox = {
  display: "flex",
  margin: "0 1rem",
  padding: "0.4rem 0",
  height: "3rem",
  backgroundColor: "var(--color-primary)",
  zIndex: "100",
  "& input.MuiInputBase-input::-webkit-search-cancel-button": {
    fontSize: "1.1rem",
    cursor: "pointer",
  },
};

const searchField = {
  backgroundColor: "var(--color-secondary)",
  flex: "1",
  "& .MuiInputBase-input": {
    color: "white",
    padding: "0 .8rem",
    fontSize: ".9rem",
    height: "100%",
  },
  "& .MuiInputBase-root": {
    height: "100%",
    borderRadius: "0",
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px var(--color-secondary) inset",
    WebkitTextFillColor: "white",
  },
};

const searchFieldIconBox = {
  border: "1px solid grey",
  borderRadius: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.5rem",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#6C757D",
  },
};

const progressIcon = {
  display: "flex",
  justifyContent: "center",
  padding: "0.7rem 0",
  "& .MuiCircularProgress-root": {
    color: "green",
    strokeLinecap: "round",
  },
  backgroundColor: "var(--color-primary)",
};

export {
  dropdown,
  dropdownIcon,
  searchFieldBox,
  searchField,
  searchFieldIconBox,
  progressIcon,
};
