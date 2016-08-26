root("http")

plugin("http")
plugin("modify")
plugin("sslstrip")
plugin("via")

config().http(
{
    port: 8899,
},
{
    port: 9000,
    name: "responder"
}
)



use("server")


