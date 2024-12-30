var HtmlTemplate = `<!DOCTYPE html>
<style>
body {
	zoom: 100%;
	font-size: 14px;
	font-weight: normal;
	line-height: normal;
	font-family: Arial, Helvetica, sans-serif;
	margin: 0px;
}
table, td, th, div, p {
	font-size: 14px;
	font-family: Arial, Helvetica, sans-serif;
	font-weight: normal;
}
th {
	background: #d9d9d8;
}
body {
    -moz-transform: scale(0.8, 0.8); /* Moz-browsers */
    zoom: 0.55; /* Other non-webkit browsers */
    zoom: 55%; /* Webkit browsers */
}
.header-right {
	text-align: right;
	width: 100%;
	font-size: 12px;
	padding: 2px;
}
.info{ width: 100%;
    font-size: 11px;
    margin: 0px;
    padding: 15px 0px 0px 15px;}
.info li{ padding-bottom:2px;}

@media print {
body {
	-webkit-print-color-adjust: exact;
}
}
</style>
<div style="width:900px; margin:auto;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" >
    <tr>
      <td style="padding:10px 0px;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td valign="middle"><img src="data:image/png;base64,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" alt="" /></td>
            <td width="100%"><div class="header-right"><strong>Booking ID :</strong> FMN1R64HZY6 </div>
              <div class="header-right"><strong>Booked on :</strong> {currentdate_time} </div></td>
          </tr>
        </table></td>
    </tr>
    <tr>
      <td><div style="border-bottom:1px solid #ED1C24; border-top:1px solid #ED1C24; text-align:center; padding:7px 0px;">Use Via.com mobile app & get more exciting deals. To download app, give a missed call: 1800-419-2291</div></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="width:150px;"><strong style="padding:3px 5px;  font-style:italic; color:#fff; background:#9e2025; width:auto; display:inline-block; ">SpiceJet</strong></td>
            <td style="border-right:2px solid #808080;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td height="40" colspan="2" style="font-size:16px;height:40px;">SpiceJet</td>
                </tr>
                <tr>
                  <td><img style="margin-right:15px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALYSURBVDhPpZRLSFRhFMfv3BmTRpqZxiYIo4YM2hlUC6VFZU1FEabMgIilzsOFtIh2EhQE9thU0GMhTjklYqgVhWBNL4pSiRa5KyiKcSFNjpY1zaSj/c69V1F8LfrDd8/5/uec//e+JmUeVFRUrLdareW4B0wm00bsKtp32qfJycmuZDLZ1tra+pX+LMwS83q9yx0ORwMCx+i+m5iYuKeq6lsEfsLZsNuwZcS2ErtmNptPNjY2JrViMC2GkAuhR7jW8fHxuubm5md6ZC6qq6uLLRbLFdz0yMjIvo6OjrjwmpjP51uG0EtGTjGTEkb7Ifxi8Hg8OW63+yGuNRaL7eju7k6rErDZbBcQcohQIpEwh0Khu8FgsLO2ttYu8fkQjUZ/s+RSXHteXt554VQK1skeIRaQGdnt9huShHAZ+1IjSQtB8skJSn1VVZVbzWQyfjo94XD4tSTgr9EyAf4ew10QUif1WVlZNaoUMKv7RkwQM6wC/9FwF4WcOsYjYhuYXb9Oa4FXYhHKxOPxMxq5BMjtR2eTHEAuzpBOKwrCdwim4Mwul+uIQS+FBPlOERuiOFfnFCUSiQzSvyo+CQ2c7BYtsDic1CQsfD5zkwsgnui8onART3HvPJzoZuIvAoHAaXJuM+t6wvlwz0dHR8Pt7e2/JJ9BC+A+yMye0jks5BS40X9SqdRe9u8NsRUIXSR5EHuCVsLtv8xgt4x0hUHlvkWxapjEIkbfrod0tLS0fBsYGChmNmeJywU1G6EpaK/H7/cXSf3Y2NhNjUDoEqL7KSic7ylVVlauzs7OLmVWu5ntWvISw8PDR51OZwahHtrjpqam4//7Nh/g5sx6m2zkX0Y6hGtj5D5OcJfwC4GV7ESoj8FXSp0ICT/9CxLwTq0knKPVsZRebCf2PVb7n7F/BSzVS7+Q/nVaPauY+z+bCXm07FE5RQfp5tOm/7QIdKXT6Tbu4xf6M6Ao/wCBQ2kSbTFopgAAAABJRU5ErkJggg==" alt="" /></td>
                  <td style="color:#ED1C24; width:100%; font-size:20px;">098 7180 3333</td>
                </tr>
              </table></td>
            <td style="padding-left:50px;"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td height="40" colspan="2" style="font-size:16px; height:40px;">CustomerCare</td>
                </tr>
                <tr>
                  <td><img style="margin-right:15px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALYSURBVDhPpZRLSFRhFMfv3BmTRpqZxiYIo4YM2hlUC6VFZU1FEabMgIilzsOFtIh2EhQE9thU0GMhTjklYqgVhWBNL4pSiRa5KyiKcSFNjpY1zaSj/c69V1F8LfrDd8/5/uec//e+JmUeVFRUrLdareW4B0wm00bsKtp32qfJycmuZDLZ1tra+pX+LMwS83q9yx0ORwMCx+i+m5iYuKeq6lsEfsLZsNuwZcS2ErtmNptPNjY2JrViMC2GkAuhR7jW8fHxuubm5md6ZC6qq6uLLRbLFdz0yMjIvo6OjrjwmpjP51uG0EtGTjGTEkb7Ifxi8Hg8OW63+yGuNRaL7eju7k6rErDZbBcQcohQIpEwh0Khu8FgsLO2ttYu8fkQjUZ/s+RSXHteXt554VQK1skeIRaQGdnt9huShHAZ+1IjSQtB8skJSn1VVZVbzWQyfjo94XD4tSTgr9EyAf4ew10QUif1WVlZNaoUMKv7RkwQM6wC/9FwF4WcOsYjYhuYXb9Oa4FXYhHKxOPxMxq5BMjtR2eTHEAuzpBOKwrCdwim4Mwul+uIQS+FBPlOERuiOFfnFCUSiQzSvyo+CQ2c7BYtsDic1CQsfD5zkwsgnui8onART3HvPJzoZuIvAoHAaXJuM+t6wvlwz0dHR8Pt7e2/JJ9BC+A+yMye0jks5BS40X9SqdRe9u8NsRUIXSR5EHuCVsLtv8xgt4x0hUHlvkWxapjEIkbfrod0tLS0fBsYGChmNmeJywU1G6EpaK/H7/cXSf3Y2NhNjUDoEqL7KSic7ylVVlauzs7OLmVWu5ntWvISw8PDR51OZwahHtrjpqam4//7Nh/g5sx6m2zkX0Y6hGtj5D5OcJfwC4GV7ESoj8FXSp0ICT/9CxLwTq0knKPVsZRebCf2PVb7n7F/BSzVS7+Q/nVaPauY+z+bCXm07FE5RQfp5tOm/7QIdKXT6Tbu4xf6M6Ao/wCBQ2kSbTFopgAAAABJRU5ErkJggg==" alt="" /></td>
                  <td style="color:#ED1C24; width:100%; font-size:18px;">080-39414141/67818181</td>
                </tr>
              </table></td>
            <td align="right" style="width:160px;"><div style="border:3px solid #808080; width:160px; padding:10px 10px 5px 10px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" valign="middle" style="padding:3px; color:#ED1C24;">AIRLINE PNR</td>
                  </tr>
                  <tr>
                    <td align="center" valign="middle" style="font-size:32px; padding:3px;">G77ZHM</td>
                  </tr>
                </table>
              </div></td>
          </tr>
        </table></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td></td>
    </tr>
    <tr>
      <td><table width="100%" border="0" cellspacing="0" cellpadding="10" style="border:1px solid #ED1C24;">
          <tr>
            <td colspan="2" valign="middle" bgcolor="#ED1C24" style="width:50%; background:#ED1C24; color:#fff;"><img style="vertical-align:middle; margin-right:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAASCAYAAAC5DOVpAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFLSURBVDhPpZTPSgJRFMbnmoX9s1Urdy6SFgXRqicpiGqViq/QawkJEZG6jYg2tYh8iSBQZvp9d05Tmslw5wcf555zz/m4d5wxmiWO43d0nSTJmpXCwaSJEgxvChtisIzRmxneFjbE5EJmgvUdIdyQ4TImL94NWN+jddv+H3q3aKxZmkHtJLVKIe8TNmx7PjQ0aYwVreQhL1F+JmaQD9CmtfyFniUaHpBoW9lDfpza/EBtiBpon/SQeIT2WDvH4oq5U+fcrppZP6Eqcmib+uKrGYx2S8RPNFaBQRmIDyRjxbyMv6/5iETHNjzk5zrtb6jpue2wrBMPiLqqbuU00EITdGYeHjb1erwSM8gX/6JsVmjSM5qC2tSpyPO9a7Mwq1P5T0qwDv8KGL5MbbxR+PfJ4AoGIzMq9s+BQceMemjVymHoVKiLX8VKOYmiL566pupFBP7iAAAAAElFTkSuQmCC" alt="" /> Onward Flight Details</td>
            <td colspan="2" valign="middle" bgcolor="#ED1C24" style="width:50%; background:#ED1C24; color:#fff; font-size:11px;">*Ple ase ve rify flig ht time s with the airline s prior to
              
              de parture</td>
          </tr>
          <tr>
            <td valign="middle" bgcolor="#d9d9d9" style="color:#ED1C24; width:15%;">Flight 1</td>
            <td valign="middle" bgcolor="#d9d9d9" style="width:30%;"><img style="vertical-align:middle; margin-right:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAKCAYAAABBq/VWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGhSURBVDhPrVPPSwJBFHbdlZbAw7J0CSRYvEYdJLoZdNmTYHooEHTV7dClfyXQQ0HKgj8gpMJrXqVTt4JSIhAKabssYqDp7vbNOodI1A364O3MfO+97703wzKef0AikQjyPB9lGEa2bTtE6XdYF5Zj0un0rtfrDXU6nXyj0fh03C6QTCY3fT4fESa2TukpoGiXUVX1DUGrlmU9DIfDWKlUalP/b3hTqdQ2x3FR7PfQmDShZwOaL+PxWCWTHCPxhJI9VFYKhcIVOYfDYU6SpB0IxmAR0gzh5wH5H1jq0LqEzg32FiPL8lIgEGhBYI0G2VhOcV5GYATiAuHnASmviL0mwv1+v1mr1UzqcuA8fDabzUDs3GH+AIg/jUajQ03TmuQ4YafBko/f778XRXEf3YsO6wIooBmGEa1Wq8+Umglnkkwmc4ZJVBRhMLIO6hHbtmmabdItzibLshVydfD3YEfFYrFCct3AKaIoygYen9d1vVWv1w3HQxGPx1cEQbhF0SDE7waDwUG5XF7Y/U8s/BkxZR4FtmAXuJ4cHvWLulzC4/kGquqxMfsQSYwAAAAASUVORK5CYII=" alt="" /> Departing</td>
            <td valign="middle" bgcolor="#d9d9d9"  style="width:30%;"><img style="vertical-align:middle; margin-right:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAANCAYAAABcrsXuAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGTSURBVDhPrZM9S8NQFIabj5IWQRxEEMGhggri1gwtqIubOIiTtJSQpNHFHyCIuLk5CwEJdHHo4FjH0FQR7SgOxUUXgy5mMdQ08U1yGyralmIeONybc27u03NKmARBEIQ8z/O32Ww22Ww2DZKOBZqsCZqm5ymKmvY877BQKIyTdCz0Sib8FaKxVCq1EyRjIpKgg0DiA5FEtrEQSXBxJEFXfLlcXiaP/4by559Opy+wz+DyhTAddPaEuMLWcBzH0DTtJayMDoWgRVHcZxhmD90shunfQPiMxeh0Og2crauq+oBnNygOwZd0oSRJWoNoF/stdMWF6b58uK7bgPwaUbcs665arX6S2g96JRHFYnGK4zgBIgXSOZIeCERfiBtErd1uX1YqlUdS+lvSRVGUJMZzBNkBZNGHOwx06I/xpNVqHeu67vSVyLJ8hou3EZMkNTJw3du2vdFXgv9nEx2sY5tBvOMFE8JXrG8YicmyrIkuWdRyOJdDbRUx67/bC86fDxzXqJRKpRnIVyDLQ7yEH0N7nnf6DajZk52gfZQbAAAAAElFTkSuQmCC" alt="" /> Arriving</td>
            <td valign="middle" bgcolor="#d9d9d9" style="width:15%;">&nbsp;</td>
          </tr>
          <tr>
            <td valign="top"><strong>SpiceJet</strong><br>
              SG-3309<br>
              Cabin: Economy</td>
            <td valign="top"><strong>{first_city}</strong><br>
            <br></td>
            <td valign="top"><strong>{second_city}</strong><br>
            <br>
            {first_date}</td>
            <td valign="top"  ><div style="border-left:2px solid #808080; width:100%; padding-left:10px;">Non Stop<br>
                01:20 Hrs<br>
                Refundable</div></td>
          </tr>
        </table>
        <table width="100%" border="0" cellspacing="0" cellpadding="10" style="border:1px solid #ED1C24;">
          <tr>
            <td colspan="2" valign="middle" bgcolor="#ED1C24" style="width:50%; background:#ED1C24; color:#fff;"><img style="vertical-align:middle; margin-right:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAASCAYAAAC5DOVpAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFKSURBVDhPnZNNLwNhFIVnFKmPxg+ws6hIRBdW/oM9G6wU/V9+AYuKiPjYisQGC2JvJyRCM+M5M6diTEnfeZKT8957555M27dRKGmaTiZJ0kWPblXDQce4aLsdDssKOlGK3gob8ygMB50qSHDe8igMFqfQmXMUdIeNejw8LE2zfJ6lGOp1j7+hN8toxmUZHmigizwih/oGG/EjGdRt+olcRcx5Ea1wXsaX0Dy6pC5Ab80ZGdS7SFwxrinoII7jVc//hYVX7FlH9IJa7Mb0bznv65U/0LAoTEFvKhQkh0/03v+YC7g+Ygufw5uo8H0Jepv5bg51B4lrxjW3yzAc9EveY4VrQW8D9dCOW4PhgcIdE9SlC0uvwaju8m946Pftf8DCL20fln/+wRW47VE1yFDgkcOesHGPqkHIBOo6cM/t6pBTJ+hQb+eWiaIvJROpqIdpfeEAAAAASUVORK5CYII=" alt="" /> Return Flight Details</td>
            <td colspan="2" valign="middle" bgcolor="#ED1C24" style="width:50%; background:#ED1C24; color:#fff; font-size:11px;">*Ple ase ve rify flig ht time s with the airline s prior to
              
              de parture</td>
          </tr>
          <tr>
            <td valign="middle" bgcolor="#d9d9d9" style="color:#ED1C24; width:15%;">Flight 2</td>
            <td valign="middle" bgcolor="#d9d9d9" style="width:30%;"><img style="vertical-align:middle; margin-right:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAKCAYAAABBq/VWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGhSURBVDhPrVPPSwJBFHbdlZbAw7J0CSRYvEYdJLoZdNmTYHooEHTV7dClfyXQQ0HKgj8gpMJrXqVTt4JSIhAKabssYqDp7vbNOodI1A364O3MfO+97703wzKef0AikQjyPB9lGEa2bTtE6XdYF5Zj0un0rtfrDXU6nXyj0fh03C6QTCY3fT4fESa2TukpoGiXUVX1DUGrlmU9DIfDWKlUalP/b3hTqdQ2x3FR7PfQmDShZwOaL+PxWCWTHCPxhJI9VFYKhcIVOYfDYU6SpB0IxmAR0gzh5wH5H1jq0LqEzg32FiPL8lIgEGhBYI0G2VhOcV5GYATiAuHnASmviL0mwv1+v1mr1UzqcuA8fDabzUDs3GH+AIg/jUajQ03TmuQ4YafBko/f778XRXEf3YsO6wIooBmGEa1Wq8+Umglnkkwmc4ZJVBRhMLIO6hHbtmmabdItzibLshVydfD3YEfFYrFCct3AKaIoygYen9d1vVWv1w3HQxGPx1cEQbhF0SDE7waDwUG5XF7Y/U8s/BkxZR4FtmAXuJ4cHvWLulzC4/kGquqxMfsQSYwAAAAASUVORK5CYII=" alt="" /> Departing</td>
            <td valign="middle" bgcolor="#d9d9d9" style="width:30%;"><img style="vertical-align:middle; margin-right:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAANCAYAAABcrsXuAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGTSURBVDhPrZM9S8NQFIabj5IWQRxEEMGhggri1gwtqIubOIiTtJSQpNHFHyCIuLk5CwEJdHHo4FjH0FQR7SgOxUUXgy5mMdQ08U1yGyralmIeONybc27u03NKmARBEIQ8z/O32Ww22Ww2DZKOBZqsCZqm5ymKmvY877BQKIyTdCz0Sib8FaKxVCq1EyRjIpKgg0DiA5FEtrEQSXBxJEFXfLlcXiaP/4by559Opy+wz+DyhTAddPaEuMLWcBzH0DTtJayMDoWgRVHcZxhmD90shunfQPiMxeh0Og2crauq+oBnNygOwZd0oSRJWoNoF/stdMWF6b58uK7bgPwaUbcs665arX6S2g96JRHFYnGK4zgBIgXSOZIeCERfiBtErd1uX1YqlUdS+lvSRVGUJMZzBNkBZNGHOwx06I/xpNVqHeu67vSVyLJ8hou3EZMkNTJw3du2vdFXgv9nEx2sY5tBvOMFE8JXrG8YicmyrIkuWdRyOJdDbRUx67/bC86fDxzXqJRKpRnIVyDLQ7yEH0N7nnf6DajZk52gfZQbAAAAAElFTkSuQmCC" alt="" /> Arriving</td>
            <td valign="middle" bgcolor="#d9d9d9" style="width:15%;" >&nbsp;</td>
          </tr>
          <tr>
            <td valign="top"><strong>SpiceJet</strong><br>
              SG-3310<br>
              Cabin: Economy</td>
            <td valign="top"><strong>{secondcity_1}</strong><br>
            {firstcity_ip}<br>
            </td>
            <td valign="top"><strong>{firstcity_1}</strong><br>
            {seconddate_ip}</td>
            <td valign="top" ><div style="border-left:2px solid #808080; width:100%; padding-left:10px;">Non Stop<br>
                01:20 Hrs<br>
                Refundable</div></td>
          </tr>
        </table></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td><table width="100%" border="0" cellspacing="0" cellpadding="10" style="border:1px solid #666;">
          <tr>
            <td colspan="3" valign="middle" style="width:50%; background:#666; color:#fff;"><img style="vertical-align:middle; margin-right:5px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAMCAYAAACEJVa/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEpSURBVDhPnZExSgNRGITfGkxlEpJWCKSInbmAwcZCwcILpFAhdla5RHINwRsERa0EuxQi2HoCCwkBC8Fdv3lvTKGuiAOz8+b/5//ZfRvKkOd5D97BhbXn1t9QFEWFoSd0CfuKIz+D0D48JdhAu3HyC1SHdeXggUcTKGw5p+A50kzuG5r0z3xWdkfzK3FLCJtWoZ1l2QuZK/sI/LXqHDupErGhR1xCc0boXWfwYD2idgPfpPjDVA73ejg/03kJin1e7xhdRTvoCay6V6U2dF195fpxUMDoIkewK49uwwV1ffMt0rbKv6rvnC55RLkhM3VgDtfhhXwZ6F86N7ef6k72tJl7qSMtWJP/BWuw5bywqyVFOv8fWjLgrcbohO3P6OffKcOjc5M0FwYfXC1a+bSjvMEAAAAASUVORK5CYII=" alt=""/> Passenger(s) Details</td>
          </tr>
          <tr>
            <td valign="middle" bgcolor="#d9d9d9" style="width:16%;">Sr No.</td>
            <td valign="middle" bgcolor="#d9d9d9" style="width:60%;"> Passenger(s) Name</td>
            <td valign="middle" bgcolor="#d9d9d9" style="width:20%;"> Type</td>
          </tr>
          <tr>
            <td valign="top">1</td>
            <td valign="top">{Person_Name}</td>
            <td valign="top">Adult{adult} & Kids {kids}</td>
          </tr>
        </table></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="width:49%;"><table width="100%" border="0" cellspacing="10" cellpadding="0" style=" border: solid #808080 1px;">
                <tr>
                  <td width="50%" valign="middle">Payment Details</td>
                  <td width="50%" align="right" valign="middle"><small>Amount (INR)</small></td>
                </tr>
                <tr>
                  <td colspan="2" style="border-bottom:1px solid #808080; border-top:1px solid #808080;"><div style="padding:10px 0px; width:100%;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="line-height:29px;">
                        <tr>
                          <td>Air Fare</td>
                          <td align="right">4,200.00</td>
                        </tr>
                        <tr>
                          <td>Taxes, Surcharge & Fees</td>
                          <td align="right">1,761.00</td>
                        </tr>
                        <tr>
                          <td>Service Tax</td>
                          <td align="right"> 0.00</td>
                        </tr>
                      </table>
                    </div></td>
                </tr>
                <tr>
                  <td valign="middle">Total</td>
                  <td align="right" valign="middle">5,961.00</td>
                </tr>
              </table></td>
            <td style="width:2%;">&nbsp;</td>
            <td style="width:49%;"><table width="100%" border="0" cellspacing="10" cellpadding="0" style=" border: solid #808080 1px;">
                <tr>
                  <td width="50%" valign="middle">Flight Inclusions</td>
                  <td width="50%" align="right" valign="middle">&nbsp;</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-bottom:1px solid #808080; border-top:1px solid #808080;"><div style="padding:10px 0px; width:100%;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="5" style="line-height:20px;">
                        <tr>
                          <th align="left" valign="middle" scope="col">Baggage</th>
                          <th align="right" valign="middle" scope="col">Adult</th>
                          <th align="right" valign="middle" scope="col">Child</th>
                          <th align="right" valign="middle" scope="col">Infant</th>
                        </tr>
                        <tr>
                          <td>Cabin Baggage</td>
                          <td align="right">7 Kg</td>
                          <td align="right">7 Kg</td>
                          <td align="right">0 Kg</td>
                        </tr>
                        <tr>
                          <td>Check-in Baggage</td>
                          <td align="right">15 Kg</td>
                          <td align="right">15 Kg</td>
                          <td align="right">0 Kg</td>
                        </tr>
                      </table>
                    </div></td>
                </tr>
                <tr>
                  <td colspan="2" valign="middle"><small>* Flig ht inclusions are subje ct to chang e with Airlines.</small></td>
                </tr>
              </table></td>
          </tr>
        </table></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="width:17%;">Important Information</td>
            <td style="width:85%;"><hr style="margin:0px; padding:0px; border-bottom:1px #808080 solid !important; border:none; width:100%;"></td>
          </tr>
          <tr>
            <td colspan="2"><ul class="info">
                <li>For any Queries, feel free to contact our 24x7  Customer Support service (080-39414141) or mail us at care@via.com.</li>
                <li>All Guests, including children and infants, must  present valid identification at check-in.</li>
                <li>Check-in beg ins 2 hours prior to the flig ht for seat  assig nment and closes 45 minutes prior to the scheduled departure.</li>
                <li>Carriag e and other services provided by the carrier  are subject to conditions of carriag e, which are hereby incorporated by  reference. These conditions may be obtained from the issuing  carrier.</li>
                <li>In case of cancellations less than 6 hours before  departure please cancel with the airlines directly. We are not responsible for  any losses if the request is received less than 6 hours before  departure.</li>
                <li>Please contact airlines for Terminal Queries.</li>
                <li>Partial cancellations are not allowed for Round-trip  Fares</li>
                <li>Meal amount is Non-Refundable</li>
                <li>Due to airport security reg ulations, no cabin bag g  ag e is allowed on flig hts orig inating from Jammu and Srinag ar Airports.</li>
                <li>Free Bag g ag e Allowance: Checkin - 15 kg, Hand bag g  ag e - 7kg.</li>
                <li>Via.com charg es a service fee of Rs. 200.0 per  ticket/passeng er for all cancellations</li>
                <li>We are not be responsible for any Flig ht  delay/Cancellation from airline's end.</li>
                <li>Kindly contact the airline at least 24 hrs before to  reconfirm your flig ht detail g iving reference of Airline PNR Number.</li>
                <li>We are a travel ag ent and all reservations made  throug h our website are as per the terms and conditions of the concerned  airlines. All modifications,cancellations and refunds of the airline  tickets shall be strictly in accordance with the policy of the concerned  airlines and we disclaim all liability in connection thereof.</li>
              </ul></td>
          </tr>
        </table></td>
    </tr>
    <tr>
      <td><hr style="margin:10px 0px; padding:0px; border-bottom:1px #808080 solid !important; border:none; width:100%;"></td>
    </tr>
    <tr>
      <td align="right" style="line-height:15px;"><small>ContactNo : 080-39414141/67818181<br>
Level 4, block b(magnolia),manyata embassy business park,bangalore - 560 045, india</small></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
    </tr>
  </table>
</div>
</html>`;



module.exports = HtmlTemplate;