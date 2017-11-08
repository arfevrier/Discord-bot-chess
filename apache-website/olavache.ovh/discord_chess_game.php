<?php
require('/[some directory]/process.php');

if(isset($_GET['tbl']) && isset($_GET['rot'])){
    header('Content-Type: image/png');
    
    $tbl = json_decode($_GET['tbl'], true);
    
    if($_GET['rot'] == 1){
        $tbl_local = $tbl;
        for ($i = 1; $i <= 9-1; $i++) {
            $tbl_local[$i][0] = $tbl[0][$i];
            $tbl_local[0][9-$i] = $tbl[$i][0];
            for ($a = 1; $a <= 9-1; $a++) {
                $tbl_local[$i][9-$a] = $tbl[$a][$i];
            };
        };
        $tbl = $tbl_local;
    } else if($_GET['rot'] == 2){
        $tbl_local = $tbl;
        for ($i = 1; $i <= 9-1; $i++) {
            $tbl_local[0][9-$i] = $tbl[0][$i];
            $tbl_local[9-$i][0] = $tbl[$i][0];
            for ($a = 1; $a <= 9-1; $a++) {
                $tbl_local[9-$i][9-$a] = $tbl[$i][$a];
            };
        };
        $tbl = $tbl_local;
    } else if($_GET['rot'] == 3){
        $tbl_local = $tbl;
        for ($i = 1; $i <= 9-1; $i++) {
            $tbl_local[9-$i][0] = $tbl[0][$i];
            $tbl_local[0][$i] = $tbl[$i][0];
            for ($a = 1; $a <= 9-1; $a++) {
                $tbl_local[9-$i][$a] = $tbl[$a][$i];
            };
        };
        $tbl = $tbl_local;
    };
    
    $first = '<!DOCTYPE html><html><head><style>body{background-color: #32363b;}td {width: 27px;height: 27px;font-weight: bold;padding: 0;}table {border-collapse: collapse;text-align: center;}</style></head><body style="font-family: Times New Roman;margin: 0;"><table>';
    
    $second = '';
    for ($i = 0; $i <= 9-1; $i++) {
        $second = $second.'<tr>';
        for ($a = 0; $a <= 9-1; $a++) {
            if((($a%2 == 0 && $i%2 == 1) OR ($a%2 == 1 && $i%2 == 0)) && $i > 0 && $a != 0){
                if($_GET['rot']%2 == 0){
                    $local_grille_color = "background-color: #ffce9e;";
                } else {
                    $local_grille_color = "background-color: #d18b47;";
                };
            } elseif((($a%2 == 0 && $i%2 == 0) OR ($a%2 == 1 && $i%2 == 1)) && $i > 0 && $a != 0){
                if($_GET['rot']%2 == 0){
                    $local_grille_color = "background-color: #d18b47;";
                } else {
                    $local_grille_color = "background-color: #ffce9e;";
                };
            } else {
                $local_grille_color = "";
            }
            if(($tbl[$i][$a] == '♖') OR ($tbl[$i][$a] == '♘') OR ($tbl[$i][$a] == '♗') OR ($tbl[$i][$a] == '♘') OR ($tbl[$i][$a] == '♕') OR ($tbl[$i][$a] == '♔') OR ($tbl[$i][$a] == '♙')){
                
                $post = '<div style="width: 100%;height: 100%;color:#FFF;font-size:20px;text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;'.$local_grille_color.'">';
                $after = '</div>';
            } elseif(($tbl[$i][$a] == '♜') OR ($tbl[$i][$a] == '♞') OR ($tbl[$i][$a] == '♝') OR ($tbl[$i][$a] == '♚') OR ($tbl[$i][$a] == '♛') OR ($tbl[$i][$a] == '♔') OR ($tbl[$i][$a] == '♟')){
                $post = '<div style="width: 100%;height: 100%;color:#000000;font-size:20px;text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'.$local_grille_color.'">';
                $after = '</div>';
            } else {
                if($tbl[$i][$a] == ''){
                    $size_local = 'width: 100%;height: 100%;';
                } else {
                    $size_local = '';
                }
                $post = '<div style="'.$size_local.'color:#dcdcdc;font-size:12px;'.$local_grille_color.'">';
                $after = '</div>';
            }
            $second = $second.'<td>'.$post.$tbl[$i][$a].$after.'</td>';
        };
        $second = $second.'</tr>';
    };
    
    $third = '</table></body></html>';
    
    $file_name = uniqid().'.png';
    exec('cd /[some directory] && ./phantomjs chess.js '.$file_name.' "'.urlencode($first.$second.$third).'"');
    echo file_get_contents('/[some directory]/'.$file_name);
    unlink('/[some directory]/'.$file_name);
} elseif(isset($_GET['r'])){
    $query = $mysqli->query("SELECT tbl,rot FROM `chess` WHERE `id`='".$_GET['r']."'")->fetch_row();
    $tbl = $query[0];
    $rot = $query[1];
    header('Location: http://olavache.ovh/discord_chess_game.php?key=chess_some_key'.'&rot='.$rot.'&tbl='.$tbl);
    
} elseif(isset($_GET['insert']) && isset($_GET['rotation'])){
    
    $mysqli->query("INSERT INTO `chess` (tbl,rot) VALUES ('".urlencode($_GET['insert'])."','".urlencode($_GET['rotation'])."')");
    $resultprint['num_id'] = $mysqli->insert_id;
    $resultprint['inserted'] = urlencode($_GET['insert']);
    echo json_encode($resultprint);
    
} else {
    
    $resultprint['error'] = 'No valid value';
    http_response_code(400);
    echo json_encode($resultprint);
}
?>