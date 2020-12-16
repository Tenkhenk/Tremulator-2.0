export const config_default = {
  port: 4000,
  error_with_stack: true,
  logs: {
    console_level: "info",
    file_level: "info",
    file_maxsize: "20m",
    file_retention: "7d",
    file_path: "./",
  },
};
