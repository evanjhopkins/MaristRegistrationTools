<?php
$cmd = "python mcp.py '".$_GET["prof"]."'";
$response = exec($cmd);
echo $response;
?>
